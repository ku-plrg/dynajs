"""Extend an isolated Babel timing setup with instrumentation and execution timing.

Usage: setup.py DYNAJS_ROOT EXPERIMENT_DIR
Run ../babel-timing/setup.py first with the desired new experiment directory.
"""
import difflib
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

repo, out = (Path(p).expanduser().resolve() for p in sys.argv[1:])
def replace(source, old, new):
    assert source.count(old) == 1, f'Non-unique patch anchor: {old[:80]}'
    return source.replace(old, new, 1)

nm_file = out / 'jalangi-profile/src/js/instrument/esnstrument.js'
source = nm_file.read_text()
before = source
source = replace(source, '    function instrumentCode(options) {', '''
    var pipelineDepth = 0;
    function instrumentCode(options) {
        var outer = pipelineDepth++ === 0;
        var start = phaseNow(), babelBefore = phase.transform_ms, success = false;
        try {
            var result = instrumentCodeUntimed(options);
            success = true;
            return result;
        } finally {
            var end = phaseNow();
            pipelineDepth--;
            if (outer) {
                var inclusive = Number(end - start) / 1e6;
                var babel = phase.transform_ms - babelBefore;
                phaseWrite(2, '\\n@@DJX_INSTRUMENT_PHASES ' + phaseStringify({
                    tool: 'nodemedic', start_ns: String(start), end_ns: String(end),
                    inclusive_ms: inclusive, babel_transform_ms: babel,
                    instrument_ms: inclusive - babel, success: success,
                    file: options.origCodeFileName || 'eval', is_eval: !!options.isEval
                }) + '\\n');
            }
        }
    }
    function instrumentCodeUntimed(options) {''')
nm_file.write_text(source)
(out / 'instrument-nodemedic.patch').write_text(''.join(difflib.unified_diff(
    before.splitlines(True), source.splitlines(True), fromfile='babel-profile', tofile='pipeline-profile')))

shadow = out / 'dynajs-profile'
shadow.mkdir()
for name in ('src', 'scripts', 'dist'):
    shutil.copytree(repo / name, shadow / name)
for name in ('node_modules', 'analyses', 'samples'):
    (shadow / name).symlink_to(repo / name, target_is_directory=True)
for name in ('package.json', 'dynajs'):
    shutil.copy2(repo / name, shadow / name)
file = shadow / 'src/instrument/main.ts'
source = file.read_text()
before = source
source = "import { writeSync as pipelineWrite } from 'node:fs';\n" + source
source = replace(source, 'export function instrument(code: string, options: StateOption): string {', '''
const pipelineNow = process.hrtime.bigint.bind(process.hrtime);
let pipelineDepth = 0;
export function instrument(code: string, options: StateOption): string {
  const outer = pipelineDepth++ === 0;
  const start = pipelineNow();
  let success = false;
  try {
    const result = instrumentUntimed(code, options);
    success = true;
    return result;
  } finally {
    const end = pipelineNow();
    pipelineDepth--;
    if (outer) {
      const ms = Number(end - start) / 1e6;
      pipelineWrite(2, '\\n@@DJX_INSTRUMENT_PHASES ' + JSON.stringify({
        tool: 'dynajs-ta', start_ns: String(start), end_ns: String(end),
        inclusive_ms: ms, babel_transform_ms: 0, instrument_ms: ms,
        success, file: options.originalPath ?? 'unknown'
      }) + '\\n');
    }
  }
}
function instrumentUntimed(code: string, options: StateOption): string {''')
file.write_text(source)
(out / 'instrument-dynajs.patch').write_text(''.join(difflib.unified_diff(
    before.splitlines(True), source.splitlines(True), fromfile='original', tofile='pipeline-profile')))
subprocess.run(['node', 'scripts/build-entry.mjs'], cwd=shadow, check=True)

# Preserve the original timing-wrapped benchmark source exactly.
shutil.copy2(Path(__file__).with_name('runtime.cjs'), out / 'runtime.cjs')
meta = json.loads((out / 'environment.json').read_text())
meta['experiment'] = 'instrumentation and execution to event-loop idle'
meta['runtime_observer_version'] = 2
meta['benchmark_timing_wrapper'] = 'unchanged original performance.now assignments'
meta['build_hashes'] = {
    label: hashlib.sha256(path.read_bytes()).hexdigest()
    for label, path in {
        'original_import': repo / 'dist/entry/import.js',
        'original_register': repo / 'dist/entry/register.js',
        'profile_import': shadow / 'dist/entry/import.js',
        'profile_register': shadow / 'dist/entry/register.js',
        'taint_analysis': repo / 'analyses/dist/Taint.mjs',
    }.items()
}
(out / 'environment.json').write_text(json.dumps(meta, indent=2) + '\n')
print(out)
