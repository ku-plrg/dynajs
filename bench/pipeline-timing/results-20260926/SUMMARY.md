# Instrumentation and execution timing

Matched, successfully completed cases for all tools: 422 / 444. Means in ms.

| Tool | Total | Babel init | Transpile | Instrument | Sync body | Execute to idle | Other |
|---|---:|---:|---:|---:|---:|---:|---:|
| baseline | 19.629 | 0.000 | 0.000 | 0.000 | 0.016 | 0.049 | 19.580 |
| dynajs-ta | 72.800 | 0.000 | 0.000 | 4.319 | 0.855 | 1.531 | 66.951 |
| nodemedic | 286.569 | 208.016 | 9.359 | 10.870 | 2.129 | 3.395 | 54.928 |

Instrument excludes Babel transformation and file I/O. Execute to idle includes async completion and event-loop drain;
it excludes process exit callbacks and is not steady-state pure JavaScript execution.
Sync body is contained in Execute to idle; do not add these two columns.
Dynamic instrumentation overlaps the execution window; its overlap is recorded separately and removed from Other accounting.
Failures are retained in measurements.csv; their missing completion times are not zero.

Verdict changes versus previous run: 0; unstable cases: 0.
Missing execution markers: 0; missing instrument markers: 0.
