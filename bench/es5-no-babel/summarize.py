"""Summarize measured CSVs, counting each case once, and compare verdicts."""
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path
import statistics
import sys

root = Path(sys.argv[1])
summary = {}
verdicts = {}
for condition in ('babel-on', 'babel-off', 'reference'):
    rows = list(csv.DictReader((root / f'measured-{condition}/results.csv').open()))
    by_runner = defaultdict(list)
    for row in rows:
        by_runner[row['runner']].append(row)
    for runner, data in by_runner.items():
        name = condition if runner == 'nodemedic' else runner
        cases = defaultdict(list)
        for row in data:
            cases[(row['benchmark'], row['case'])].append(row)
        unstable = [key for key, values in cases.items()
                    if len({(v['actual'], v['result'], v['exit_code'], v['timed_out']) for v in values}) > 1]
        counts = Counter(v[0]['result'] for v in cases.values())
        tp, fp, fn, tn = (counts[k] for k in ('TP', 'FP', 'FN', 'TN'))
        div = lambda a, b: a / b if b else None
        # Each case in this subset is a separate file with one assertion.
        assert len({k[0] for k in cases}) == len(cases)
        assert len(cases) == 156, f'Incomplete ES5 suite: {name}'
        assert len({len(v) for v in cases.values()}) == 1, f'Incomplete repetitions: {name}'
        summary[name] = dict(cases=len(cases), measurements=len(data), confusion=dict(counts),
            errors=sum(v[0]['actual'] == 'error' for v in cases.values()),
            timeouts=sum(v[0]['timed_out'] == 'true' for v in cases.values()),
            nonzero_exits=sum(v[0]['exit_code'] != '0' for v in cases.values()),
            precision=div(tp, tp+fp), recall=div(tp, tp+fn),
            accuracy=div(tp+tn, tp+fp+fn+tn), f1=div(2*tp, 2*tp+fp+fn),
            mean_ms=statistics.mean(float(r['elapsed_ms']) for r in data),
            median_ms=statistics.median(float(r['elapsed_ms']) for r in data),
            unstable=unstable)
        body_mins = [min(float(r['exec_ms']) for r in values if r['exec_ms'])
                     for values in cases.values() if any(r['exec_ms'] for r in values)]
        summary[name]['mean_body_min_ms'] = statistics.mean(body_mins) if body_mins else None
        if runner == 'baseline':
            # Plain Node supplies time only; its stub assertions are not predictions.
            for field in ('confusion', 'precision', 'recall', 'accuracy', 'f1'):
                summary[name][field] = None
        verdicts[name] = {key: values[0] for key, values in cases.items()}
baseline = summary['baseline']['mean_ms']
for row in summary.values():
    row['overhead'] = row['mean_ms'] / baseline
changes = []
assert verdicts['babel-on'].keys() == verdicts['babel-off'].keys()
for key, before in verdicts['babel-on'].items():
    after = verdicts['babel-off'][key]
    if before['actual'] != after['actual']:
        changes.append(dict(benchmark=key[0], expected=before['expected'],
                            babel_on=before['actual'], babel_off=after['actual']))
result = dict(summary=summary, changed_verdicts=changes)
(root / 'summary.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
