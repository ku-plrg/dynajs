"""Prepare an isolated Table 3 ES5 ablation on a configured experiment host.

Usage: python3 setup.py DYNAJS_ROOT NODEMEDIC_ROOT OUTPUT_ROOT
No installed source is modified. Node must already be on PATH.
"""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

repo, nm, out = map(lambda p: Path(p).expanduser().resolve(), sys.argv[1:])
out.mkdir(parents=True, exist_ok=False)
(out / 'node_modules').symlink_to(nm / 'node_modules', target_is_directory=True)

def replace_once(source, old, new):
    assert source.count(old) == 1, f"Expected unique patch anchor: {old[:80]}"
    return source.replace(old, new, 1)

original = nm / 'lib/jalangi2-babel'
for mode in ('on', 'off'):
    dest = out / f'jalangi-babel-{mode}'
    shutil.copytree(original, dest, ignore=shutil.ignore_patterns('node_modules', '.git'))
    (dest / 'node_modules').symlink_to(original / 'node_modules', target_is_directory=True)
    if mode == 'off':
        file = dest / 'src/js/instrument/esnstrument.js'
        source = file.read_text()
        start = source.index('    // Import babel for conversion of code to ES5')
        end = source.index('    var global = this;', start)
        source = source[:start] + '    // ES5 ablation: no Babel loading, warmup, helpers, or transformation.\n' + source[end:]
        start = source.index('        // Call babel with @babel/preset-env to convert code to ES5')
        end = source.index('        var newAst = acorn.parse', start)
        source = source[:start] + '        var codeP = code;\n\n' + source[end:]
        assert 'babel.transformSync' not in source
        file.write_text(source)

source = (repo / 'bench/run-micro-benchmark.mjs').read_text()
source = replace_once(source, 'const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");', 'const REPO_ROOT = ' + json.dumps(str(repo)) + ';')
source = replace_once(source, 'const NODEMEDIC_JALANGI_CMD = path.join(', 'const NODEMEDIC_JALANGI_CMD = process.env.ES5_JALANGI_CMD ?? path.join(')
source = replace_once(source, 'if (opts.onlyDone) benches = benches.filter((b) => b.done);', 'if (opts.onlyDone) benches = benches.filter((b) => b.done);\n  benches = benches.filter((b) => b.target === "es5");')
(out / 'run-es5.mjs').write_text(source)

def command(*args):
    return subprocess.check_output(args, text=True).strip()

meta = {'dynajs': command('git', '-C', str(repo), 'rev-parse', 'HEAD'),
        'nodemedic': command('git', '-C', str(nm), 'rev-parse', 'HEAD'),
        'node': command('node', '--version'), 'cpu': command('lscpu'),
        'dynajs_status': command('git', '-C', str(repo), 'status', '--short'),
        'nodemedic_status': command('git', '-C', str(nm), 'status', '--short'),
        'policies': 'string:precise,array:precise,object:precise',
        'original_instrumenter_sha256': hashlib.sha256((original / 'src/js/instrument/esnstrument.js').read_bytes()).hexdigest()}
meta['runner_sha256'] = hashlib.sha256((repo / 'bench/run-micro-benchmark.mjs').read_bytes()).hexdigest()
meta['node_path'] = command('node', '-p', 'process.execPath')
meta['source_roots'] = dict(dynajs=str(repo), nodemedic=str(nm))
(out / 'environment.json').write_text(json.dumps(meta, indent=2) + '\n')
print(out)
