"""Merge Babel phase markers with per-process results, preserving failures.

Usage: python3 summarize.py EXPERIMENT_DIR
Produces measurements.csv, summary.json, and SUMMARY.md.
"""
import csv
import json
import math
from collections import Counter, defaultdict
from pathlib import Path
import statistics
import sys

PHASE_FIELDS = ('init_ms', 'load_ms', 'warmup_ms', 'helpers_ms', 'transform_ms',
                'transform_calls', 'transform_failures', 'init_complete')
TIME_FIELDS = ('elapsed_ms', 'init_ms', 'load_ms', 'warmup_ms', 'helpers_ms',
               'transform_ms', 'babel_total_ms', 'total_minus_transform_ms',
               'total_minus_babel_ms')

def mean(values):
    values = [float(v) for v in values if v is not None and v != '']
    return statistics.mean(values) if values else None

def read_rows(root, condition):
    return list(csv.DictReader((root / condition / 'results.csv').open()))

def successful(row):
    return row['exit_code'] == '0' and row['timed_out'] == 'false' and row['actual'] != 'error'

def unique_cases(rows):
    cases = defaultdict(list)
    for row in rows:
        cases[(row['runner'], row['benchmark'], row['case'])].append(row)
    return cases

def quality(rows):
    cases = unique_cases(rows)
    first = [values[0] for values in cases.values()]
    counts = Counter(row['result'] for row in first)
    return dict(cases=len(cases), confusion=dict(counts),
                errors=sum(row['actual'] == 'error' for row in first),
                timeouts=sum(row['timed_out'] == 'true' for row in first),
                unstable=[list(key) for key, values in cases.items()
                          if len({(r['actual'], r['expected'], r['exit_code'], r['timed_out']) for r in values}) != 1])

def main(root):
    profile = read_rows(root, 'profile')
    control = read_rows(root, 'control')
    reference = read_rows(root, 'reference')
    reps = dict(line.split('=', 1) for line in (root / 'run-config.txt').read_text().splitlines())
    expected_reps = int(reps['reps'])
    for label, rows, count in [('profile', profile, expected_reps), ('control', control, 1),
                                ('baseline', [r for r in reference if r['runner'] == 'baseline'], expected_reps),
                                ('dynajs-ta', [r for r in reference if r['runner'] == 'dynajs-ta'], expected_reps)]:
        cases = unique_cases(rows)
        assert len(cases) == 444, (label, 'incomplete cases', len(cases))
        assert all(len(values) == count for values in cases.values()), (label, 'incomplete repetitions')
    # This corpus has one assertion per file. Avoid timing duplication if that changes.
    assert len(profile) == len({(r['runner'], r['benchmark'], r['rep']) for r in profile})
    enriched = []
    for original in profile:
        row = dict(original)
        log = root / 'profile/logs' / f"{row['runner']}__{row['benchmark']}__rep{row['rep']}.stderr"
        markers = [line.split(' ', 1)[1] for line in log.read_text().splitlines()
                   if line.startswith('@@DJX_BABEL_PHASES ')]
        assert len(markers) <= 1, f'Duplicate phase markers: {log}'
        row.update({field: None for field in PHASE_FIELDS})
        row.update({field: None for field in TIME_FIELDS if field != 'elapsed_ms'})
        row['phase_marker_present'] = bool(markers)
        if markers:
            phase = json.loads(markers[0])
            assert phase['version'] == 1
            for field in PHASE_FIELDS:
                row[field] = phase[field]
            for field in PHASE_FIELDS[:7]:
                assert math.isfinite(row[field]) and row[field] >= 0
            if phase['init_complete']:
                row['babel_total_ms'] = phase['init_ms'] + phase['transform_ms']
                row['total_minus_transform_ms'] = float(row['elapsed_ms']) - phase['transform_ms']
                row['total_minus_babel_ms'] = float(row['elapsed_ms']) - row['babel_total_ms']
                assert row['total_minus_babel_ms'] >= -0.1, log
                assert phase['init_ms'] + 0.1 >= sum(phase[f] for f in ('load_ms', 'warmup_ms', 'helpers_ms'))
        enriched.append(row)
    with (root / 'measurements.csv').open('w') as f:
        writer = csv.DictWriter(f, fieldnames=list(enriched[0]))
        writer.writeheader()
        writer.writerows(enriched)

    control_cases = {key[1:]: values[0] for key, values in unique_cases(control).items()}
    changes = []
    for key, values in unique_cases(profile).items():
        before, after = control_cases[key[1:]], values[0]
        if (before['actual'], before['expected'], before['exit_code']) != (after['actual'], after['expected'], after['exit_code']):
            changes.append(dict(benchmark=key[1], control=before['actual'], profile=after['actual'],
                                control_exit=before['exit_code'], profile_exit=after['exit_code']))

    groups = {}
    predicates = {'Overall': lambda r: True,
                  'ES5': lambda r: r['target'] == 'es5',
                  'ES6+': lambda r: r['target'] == 'es6+',
                  'Built-ins': lambda r: r['feature'] == 'builtin',
                  'Syntax': lambda r: r['feature'] == 'syntax'}
    for name, predicate in predicates.items():
        rows = [r for r in enriched if predicate(r)]
        valid = [r for r in rows if r['phase_marker_present'] and r['init_complete']]
        ok = [r for r in valid if successful(r)]
        refs = {runner: [r for r in reference if r['runner'] == runner and predicate(r)]
                for runner in ('baseline', 'dynajs-ta')}
        groups[name] = dict(measurements=len(rows), complete_phase_measurements=len(valid),
            quality=quality(rows), means_ms={field: mean([r[field] for r in valid]) for field in TIME_FIELDS},
            successful_measurements=len(ok), successful_means_ms={field: mean([r[field] for r in ok]) for field in TIME_FIELDS},
            transform_call_counts=dict(Counter(r['transform_calls'] for r in valid)),
            transform_failure_measurements=sum(r['transform_failures'] > 0 for r in valid),
            control_mean_ms=mean([r['elapsed_ms'] for r in control if predicate(r)]),
            reference={runner: dict(mean_ms=mean([r['elapsed_ms'] for r in rs]),
                                    quality=quality(rs) if runner != 'baseline' else None)
                       for runner, rs in refs.items()})
        means = groups[name]['means_ms']
        groups[name]['transform_share_percent'] = 100 * means['transform_ms'] / means['elapsed_ms'] if means['elapsed_ms'] else None
        groups[name]['babel_share_percent'] = 100 * means['babel_total_ms'] / means['elapsed_ms'] if means['elapsed_ms'] else None
    result = dict(configuration=reps, groups=groups, changed_verdicts=changes,
                  missing_phase_measurements=[dict(benchmark=r['benchmark'], rep=r['rep']) for r in enriched
                                              if not r['phase_marker_present'] or not r['init_complete']])
    (root / 'summary.json').write_text(json.dumps(result, indent=2) + '\n')
    lines = ['# Babel phase timing', '',
             'All times are per-process means in milliseconds. Failure runs remain included.', '',
             '| Group | Cases | Total | Babel init | Source transform | Total − transform | Total − all Babel | DynaJS total | Node total |',
             '|---|---:|---:|---:|---:|---:|---:|---:|---:|']
    for name, group in groups.items():
        m = group['means_ms']
        values = [m[f] for f in ('elapsed_ms', 'init_ms', 'transform_ms', 'total_minus_transform_ms', 'total_minus_babel_ms')]
        values += [group['reference'][r]['mean_ms'] for r in ('dynajs-ta', 'baseline')]
        lines.append(f"| {name} | {group['quality']['cases']} | " + ' | '.join(f'{v:.2f}' if v is not None else 'N/A' for v in values) + ' |')
    lines += ['', 'Babel init includes module loading, the original empty-source warmup, and helper loading.',
              'Subtracted totals are accounting residuals, not measured Babel-disabled runs or pure execution time.',
              'Source-transform attempts that throw are timed; transform failure counts are in summary.json.',
              'Body execution timers can overlap dynamic transforms and are not additive with these phases.', '',
              f"Verdict changes versus unprofiled control: {len(changes)}.",
              f"Missing/incomplete phase measurements: {len(result['missing_phase_measurements'])}.",
              'See summary.json for successful-only means, errors, and repeat consistency.']
    (root / 'SUMMARY.md').write_text('\n'.join(lines) + '\n')
    print('\n'.join(lines))

if __name__ == '__main__':
    main(Path(sys.argv[1]))
