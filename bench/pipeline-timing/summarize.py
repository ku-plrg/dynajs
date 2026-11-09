"""Print and save per-stage times. Usage: summarize.py EXPERIMENT_DIR"""
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path
import statistics
import sys

RUNNERS = ('baseline', 'dynajs-ta', 'nodemedic')
FIELDS = ('wall_ms', 'babel_init_ms', 'babel_transform_ms', 'instrument_ms',
          'instrument_inclusive_ms', 'sync_body_ms', 'execution_to_idle_ms',
          'dynamic_instrument_inclusive_ms', 'other_ms')

def markers(text, name):
    prefix = '@@DJX_' + name + ' '
    return [json.loads(line[len(prefix):]) for line in text.splitlines() if line.startswith(prefix)]

def average(rows, field):
    values = [r[field] for r in rows if r[field] is not None]
    return statistics.mean(values) if values else None

def main(root):
    raw = list(csv.DictReader((root / 'measured/results.csv').open()))
    reps = int(dict(line.split('=', 1) for line in (root / 'run-config.txt').read_text().splitlines())['reps'])
    cases = defaultdict(list)
    parsed = []
    for row in raw:
        cases[(row['runner'], row['benchmark'])].append(row)
        path = root / 'measured/logs' / f"{row['runner']}__{row['benchmark']}__rep{row['rep']}.stderr"
        log = path.read_text()
        execution = markers(log, 'EXECUTION_PHASES')
        inst = markers(log, 'INSTRUMENT_PHASES')
        babel = markers(log, 'BABEL_PHASES')
        assert len(execution) <= 1 and len(babel) <= 1, path
        e = execution[0] if execution else {}
        b = babel[0] if babel else {}
        if e.get('sync_body_ms') is not None and row['exec_ms']:
            assert abs(e['sync_body_ms'] - float(row['exec_ms'])) <= 0.00051, ('Timestamp unboxing mismatch', path)
        r = {**row, 'wall_ms': float(row['elapsed_ms']),
             'execution_marker_present': bool(execution),
             'sync_body_ms': e.get('sync_body_ms'),
             'execution_to_idle_ms': e.get('execution_to_idle_ms'),
             'natural_completion': e.get('natural_completion', False),
             'instrument_calls': len(inst),
             'instrument_failures': sum(not call['success'] for call in inst),
             'instrument_ms': sum(call['instrument_ms'] for call in inst) if inst else (0 if row['runner'] == 'baseline' else None),
             'instrument_inclusive_ms': sum(call['inclusive_ms'] for call in inst) if inst else (0 if row['runner'] == 'baseline' else None),
             'babel_init_ms': b.get('init_ms') if row['runner'] == 'nodemedic' else 0,
             'babel_transform_ms': b.get('transform_ms') if row['runner'] == 'nodemedic' else 0,
             'dynamic_instrument_inclusive_ms': 0.0, 'other_ms': None}
        intervals = sorted((int(c['start_ns']), int(c['end_ns'])) for c in inst)
        # Outermost-only wrappers should produce disjoint intervals in this corpus.
        assert all(a[1] <= z[0] for a, z in zip(intervals, intervals[1:])), path
        if e.get('start_ns') is not None and e.get('idle_ns') is not None:
            lo, hi = int(e['start_ns']), int(e['idle_ns'])
            r['dynamic_instrument_inclusive_ms'] = sum(max(0, min(end, hi) - max(start, lo)) / 1e6
                                                       for start, end in intervals)
        r['completed'] = (r['natural_completion'] and row['exit_code'] == '0'
                          and row['timed_out'] == 'false' and row['actual'] != 'error')
        if r['completed'] and all(r[f] is not None for f in ('instrument_inclusive_ms', 'babel_init_ms', 'execution_to_idle_ms')):
            r['other_ms'] = (r['wall_ms'] - r['babel_init_ms'] - r['instrument_inclusive_ms']
                             - r['execution_to_idle_ms'] + r['dynamic_instrument_inclusive_ms'])
            assert r['other_ms'] >= -0.1, path
        if row['runner'] == 'nodemedic' and inst and babel:
            assert abs(sum(c['babel_transform_ms'] for c in inst) - b['transform_ms']) < 0.001, path
        parsed.append(r)
    for runner in RUNNERS:
        subset = {key: rs for key, rs in cases.items() if key[0] == runner}
        assert len(subset) == 444, (runner, len(subset))
        assert all(len(rs) == reps and len({r['rep'] for r in rs}) == reps for rs in subset.values())
        assert all(r['case'] == '0' for rs in subset.values() for r in rs), 'Multiple assertions require timing deduplication'
    unstable = [list(key) for key, rows in cases.items()
                if len({(r['expected'], r['actual'], r['exit_code'], r['timed_out']) for r in rows}) > 1]
    parsed_cases = defaultdict(list)
    for r in parsed:
        parsed_cases[(r['runner'], r['benchmark'])].append(r)
    successful = {runner: {key[1] for key, rs in parsed_cases.items() if key[0] == runner and all(r['completed'] for r in rs)} for runner in RUNNERS}
    common = set.intersection(*(successful[runner] for runner in RUNNERS))
    reference_file = root / 'verdict-reference.csv'
    changes = []
    if reference_file.exists():
        previous = {(r['runner'], r['benchmark']): r for r in csv.DictReader(reference_file.open())}
        for key, rs in cases.items():
            if key[0] == 'baseline': continue
            before, after = previous[key], rs[0]
            if (before['expected'], before['actual'], before['exit_code']) != (after['expected'], after['actual'], after['exit_code']):
                changes.append(dict(runner=key[0], benchmark=key[1], before=before['actual'], after=after['actual']))
    with (root / 'measurements.csv').open('w') as file:
        writer = csv.DictWriter(file, fieldnames=list(parsed[0]))
        writer.writeheader()
        writer.writerows(parsed)
    grouped = {}
    predicates = {'Overall': lambda r: True, 'ES5': lambda r: r['target'] == 'es5',
                  'ES6+': lambda r: r['target'] == 'es6+',
                  'Built-ins': lambda r: r['feature'] == 'builtin', 'Syntax': lambda r: r['feature'] == 'syntax'}
    for group, pred in predicates.items():
        grouped[group] = {}
        for runner in RUNNERS:
            rows = [r for r in parsed if r['runner'] == runner and pred(r)]
            ok = [r for r in rows if r['completed']]
            matched = [r for r in rows if r['benchmark'] in common]
            first = [rs[0] for key, rs in parsed_cases.items() if key[0] == runner and pred(rs[0])]
            grouped[group][runner] = dict(cases=len(first), completed_cases=len({r['benchmark'] for r in ok}),
                common_cases=len({r['benchmark'] for r in matched}), measurements=len(rows),
                errors=sum(r['actual'] == 'error' for r in first),
                confusion=dict(Counter(r['result'] for r in first)) if runner != 'baseline' else None,
                all_means={f: average(rows, f) for f in FIELDS},
                completed_means={f: average(ok, f) for f in FIELDS},
                common_means={f: average(matched, f) for f in FIELDS})
    result = dict(groups=grouped, common_cases=sorted(common), unstable=unstable,
                  reference_checked=reference_file.exists(), changed_verdicts=changes,
                  missing_execution_markers=sum(not r['execution_marker_present'] for r in parsed),
                  missing_instrument_markers=sum(r['runner'] != 'baseline' and r['instrument_ms'] is None for r in parsed),
                  dynamic_instrument_runs=sum(r['dynamic_instrument_inclusive_ms'] > 0 for r in parsed))
    (root / 'summary.json').write_text(json.dumps(result, indent=2) + '\n')
    lines = ['# Instrumentation and execution timing', '',
             f'Matched, successfully completed cases for all tools: {len(common)} / 444. Means in ms.', '',
             '| Tool | Total | Babel init | Transpile | Instrument | Sync body | Execute to idle | Other |',
             '|---|---:|---:|---:|---:|---:|---:|---:|']
    for runner in RUNNERS:
        means = grouped['Overall'][runner]['common_means']
        fields = ('wall_ms', 'babel_init_ms', 'babel_transform_ms', 'instrument_ms', 'sync_body_ms', 'execution_to_idle_ms', 'other_ms')
        lines.append('| ' + runner + ' | ' + ' | '.join(f'{means[f]:.3f}' if means[f] is not None else 'N/A' for f in fields) + ' |')
    lines += ['', 'Instrument excludes Babel transformation and file I/O. Execute to idle includes async completion and event-loop drain;',
              'it excludes process exit callbacks and is not steady-state pure JavaScript execution.',
              'Sync body is contained in Execute to idle; do not add these two columns.',
              'Dynamic instrumentation overlaps the execution window; its overlap is recorded separately and removed from Other accounting.',
              'Failures are retained in measurements.csv; their missing completion times are not zero.', '',
              f"Verdict changes versus previous run: {len(changes) if reference_file.exists() else 'not checked'}; unstable cases: {len(unstable)}.",
              f"Missing execution markers: {result['missing_execution_markers']}; missing instrument markers: {result['missing_instrument_markers']}."]
    (root / 'SUMMARY.md').write_text('\n'.join(lines) + '\n')
    print('\n'.join(lines))

if __name__ == '__main__':
    main(Path(sys.argv[1]))
