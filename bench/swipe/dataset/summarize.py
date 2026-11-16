"""Summarize SWIPE DSE runs: results/<mode>/<id>/ -> one row per (page, mode).

    python3 summarize.py ~/swipe/results [ids-file] [mode,mode,...]   (default jalangi,dynajs)

Columns: id, mode, crawl ok, DSE visits, distinct generated URLs, potential flows
reported during the (instrumented) DSE run, whether the analysis itself reported a
sink (`Found XSS` -> SWIPE's "Sink was hit", which also ends DSE for the site),
wall seconds, peak container memory, and for DynaJS the instrumentation counts
(scripts ok / failed / JSON skipped / served from cache).
For passive-of-<mode> (confirmation re-runs), `potential` is the comparable number:
flows of the page itself on the URLs that <mode>'s DSE generated.
Also writes <results>/dse-urls/<mode>/<id>.txt: the URLs DSE visited, for the
non-instrumented confirmation re-run.
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse


def visits(log: str):
    urls = []
    for m in re.finditer(r'Start URL: (\S+)', log):
        q = parse_qs(urlparse(m.group(1)).query)
        if 'target' in q:
            urls.append(q['target'][0])
    return urls


def potential_flows(out: Path):
    if not out.exists():
        return None
    m = re.search(r'#Unique potential: (\d+)', out.read_text(errors='replace'))
    return int(m.group(1)) if m else None


def instr_counts(p: Path):
    if not p.exists():
        return None
    ok = fail = js = cached = 0
    for line in p.read_text(errors='replace').splitlines():
        e = json.loads(line)
        if e.get('cached'):
            cached += 1
        elif e.get('ok'):
            ok += 1
        elif e.get('json'):
            js += 1
        else:
            fail += 1
    return ok, fail, js, cached


def main(root: Path, ids_file: Path | None, modes=('jalangi', 'dynajs')):
    ids = ids_file.read_text().split() if ids_file else None
    rows = []
    for mode in modes:
        for d in sorted((root / mode).glob('*')):
            if ids and d.name not in ids:
                continue
            stats = json.loads((d / 'stats.json').read_text()) if (d / 'stats.json').exists() else {}
            log = (d / 'run.log').read_text(errors='replace') if (d / 'run.log').exists() else ''
            v = visits(log)
            ok = 'Success: 1' in log
            out_dir = root / 'dse-urls' / mode
            out_dir.mkdir(parents=True, exist_ok=True)
            (out_dir / f'{d.name}.txt').write_text(''.join(u + '\n' for u in dict.fromkeys(v)))
            ic = instr_counts(d / 'dynajs-instrument.jsonl') if mode.startswith('dynajs') else None
            rows.append({
                'id': d.name, 'mode': mode, 'crawl_ok': ok, 'visits': len(v),
                'urls': len(set(v)), 'potential': potential_flows(d / 'output.txt'),
                'sink_hit': 'Sink was hit' in log,
                'seconds': round(stats.get('seconds', 0), 1),
                'peak_mem_mb': round(stats.get('peak_mem_bytes', 0) / 2**20),
                'instr_ok': ic and ic[0], 'instr_fail': ic and ic[1], 'instr_json': ic and ic[2],
                'instr_cached': ic and ic[3],
            })
    cols = list(rows[0]) if rows else []
    print('\t'.join(cols))
    for r in rows:
        print('\t'.join('' if r[c] is None else str(r[c]) for c in cols))
    (root / f"summary-{'+'.join(modes)}.json").write_text(json.dumps(rows, indent=1))


if __name__ == '__main__':
    main(Path(sys.argv[1]), Path(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] != '-' else None,
         *([sys.argv[3].split(',')] if len(sys.argv) > 3 else []))
