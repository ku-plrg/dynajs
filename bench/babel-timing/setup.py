"""Prepare isolated, phase-timed Jalangi copies. Usage: setup.py DYNAJS NODEMEDIC OUT"""
import hashlib
import difflib
import json
from pathlib import Path
import shutil
import subprocess
import sys

repo, nm, out = (Path(p).expanduser().resolve() for p in sys.argv[1:])
out.mkdir(parents=True, exist_ok=False)
(out / 'node_modules').symlink_to(nm / 'node_modules', target_is_directory=True)

def replace(source, old, new):
    assert source.count(old) == 1, f'Patch anchor is not unique: {old[:80]}'
    return source.replace(old, new, 1)

original = nm / 'lib/jalangi2-babel'
for mode in ('control', 'profile'):
    dest = out / f'jalangi-{mode}'
    shutil.copytree(original, dest, ignore=shutil.ignore_patterns('node_modules', '.git'))
    (dest / 'node_modules').symlink_to(original / 'node_modules', target_is_directory=True)

file = out / 'jalangi-profile/src/js/instrument/esnstrument.js'
source = file.read_text()
source = replace(source, '    // Import babel for conversion of code to ES5', r'''
    // Profiling only: capture native helpers before analysis hooks are active.
    var phaseNow = process.hrtime.bigint.bind(process.hrtime);
    var phaseWrite = require('fs').writeSync;
    var phaseStringify = globalThis.JSON.stringify;
    var phase = {version: 1, init_ms: 0, load_ms: 0, warmup_ms: 0,
                 helpers_ms: 0, transform_ms: 0, transform_calls: 0,
                 transform_failures: 0, init_complete: false};
    process.once('exit', function () {
        phaseWrite(2, '\n@@DJX_BABEL_PHASES ' + phaseStringify(phase) + '\n');
    });
    var phaseInitStart = phaseNow();
    // Import babel for conversion of code to ES5''')
source = replace(source, "    var babel = require('@babel/core');", "    var babel = require('@babel/core');\n    phase.load_ms = Number(phaseNow() - phaseInitStart) / 1e6;")
source = replace(source, "    babel.transformSync('', babelOptions);", "    var phaseWarmupStart = phaseNow();\n    babel.transformSync('', babelOptions);\n    phase.warmup_ms = Number(phaseNow() - phaseWarmupStart) / 1e6;\n    var phaseHelpersStart = phaseNow();")
source = replace(source, '    require("regenerator-runtime");', '    require("regenerator-runtime");\n    phase.helpers_ms = Number(phaseNow() - phaseHelpersStart) / 1e6;\n    phase.init_ms = Number(phaseNow() - phaseInitStart) / 1e6;\n    phase.init_complete = true;')
source = replace(source, '''        try {
            var codeP = babel.transformSync(code, babelOptions).code;''', '''        var phaseTransformStart = phaseNow();
        phase.transform_calls++;
        try {
            var codeP = babel.transformSync(code, babelOptions).code;''')
source = replace(source, '''        } catch (e) {
            console.error(`Failed to transform code with babel: ${e}`);
            var codeP = code;
        }''', '''        } catch (e) {
            phase.transform_failures++;
            console.error(`Failed to transform code with babel: ${e}`);
            var codeP = code;
        } finally {
            phase.transform_ms += Number(phaseNow() - phaseTransformStart) / 1e6;
        }''')
file.write_text(source)
(out / 'phase-instrumentation.patch').write_text(''.join(difflib.unified_diff(
    (original / 'src/js/instrument/esnstrument.js').read_text().splitlines(keepends=True),
    source.splitlines(keepends=True),
    fromfile='jalangi-control/src/js/instrument/esnstrument.js',
    tofile='jalangi-profile/src/js/instrument/esnstrument.js')))

runner = (repo / 'bench/run-micro-benchmark.mjs').read_text()
runner = replace(runner, 'const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");', 'const REPO_ROOT = ' + json.dumps(str(repo)) + ';')
runner = replace(runner, 'const NODEMEDIC_JALANGI_CMD = path.join(', 'const NODEMEDIC_JALANGI_CMD = process.env.BABEL_TIMING_JALANGI_CMD ?? path.join(')
(out / 'runner.mjs').write_text(runner)

def command(*args):
    return subprocess.check_output(args, text=True).strip()

meta = {
    'dynajs_commit': command('git', '-C', str(repo), 'rev-parse', 'HEAD'),
    'nodemedic_commit': command('git', '-C', str(nm), 'rev-parse', 'HEAD'),
    'dynajs_status': command('git', '-C', str(repo), 'status', '--short'),
    'nodemedic_status': command('git', '-C', str(nm), 'status', '--short'),
    'node': command('node', '--version'), 'cpu': command('lscpu'),
    'policies': 'string:precise,array:precise,object:precise',
    'source_roots': {'dynajs': str(repo), 'nodemedic': str(nm)},
    'original_instrumenter_sha256': hashlib.sha256((original / 'src/js/instrument/esnstrument.js').read_bytes()).hexdigest(),
    'benchmarks': {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest()
                   for p in sorted((repo / 'bench/micro').rglob('*.js'))
                   if '// @done' in p.read_text() and '// @type taint' in p.read_text()},
}
meta['node_path'] = command('node', '-p', 'process.execPath')
meta['package_versions'] = json.loads(command('node', '-e', r'''
const fs = require('fs'), path = require('path'), {createRequire} = require('module');
const inst = createRequire(process.argv[1]);
const cwd = createRequire(path.join(process.argv[2], 'package.json'));
const versions = {};
for (const [name, resolver] of [['@babel/core', inst], ['@babel/preset-env', cwd],
                               ['@babel/helpers', inst], ['regenerator-runtime', inst]]) {
    const file = resolver.resolve(name + '/package.json');
    versions[name] = {version: JSON.parse(fs.readFileSync(file, 'utf8')).version, path: file};
}
console.log(JSON.stringify(versions));
''', str(file), str(nm)))
assert len(meta['benchmarks']) == 444
(out / 'environment.json').write_text(json.dumps(meta, indent=2) + '\n')
print(out)
