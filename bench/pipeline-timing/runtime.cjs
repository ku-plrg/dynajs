// Observe the existing benchmark timestamps without adding analyzed helper calls.
if (require('node:worker_threads').isMainThread) {
  const { performance } = require('node:perf_hooks');
  const perfNow = performance.now.bind(performance);
  const now = process.hrtime.bigint.bind(process.hrtime);
  const write = require('node:fs').writeSync;
  const stringify = JSON.stringify;
  let idlePerf = null, idleNs = null;
  // Do not read/unbox analysis-wrapped timestamps until after the end timestamp.
  process.on('beforeExit', function () { idlePerf = perfNow(); idleNs = now(); });
  process.once('exit', function (code) {
    const t0 = Number(globalThis.__djx_t0), t1 = Number(globalThis.__djx_t1);
    const started = Number.isFinite(t0), ended = Number.isFinite(t1);
    const complete = code === 0 && started && ended && idlePerf !== null;
    // Map performance.now() to hrtime's monotonic scale at the idle event.
    // Capture skew is a few microseconds; phase durations use their native clocks.
    const startNs = started && idleNs !== null ? idleNs - BigInt(Math.round((idlePerf - t0) * 1e6)) : null;
    const data = {start_ns: startNs === null ? null : String(startNs),
      idle_ns: idleNs === null ? null : String(idleNs),
      sync_body_ms: started && ended ? t1 - t0 : null,
      execution_to_idle_ms: complete ? idlePerf - t0 : null,
      natural_completion: complete};
    write(2, '\n@@DJX_EXECUTION_PHASES ' + stringify(data) + '\n');
  });
}
