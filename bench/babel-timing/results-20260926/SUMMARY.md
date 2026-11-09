# Babel phase timing

All times are per-process means in milliseconds. Failure runs remain included.

| Group | Cases | Total | Babel init | Source transform | Total − transform | Total − all Babel | DynaJS total | Node total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Overall | 444 | 284.84 | 206.44 | 9.71 | 275.13 | 68.69 | 71.77 | 18.99 |
| ES5 | 156 | 284.65 | 207.24 | 8.90 | 275.75 | 68.51 | 71.70 | 18.93 |
| ES6+ | 288 | 284.94 | 206.00 | 10.14 | 274.80 | 68.79 | 71.81 | 19.03 |
| Built-ins | 323 | 283.55 | 206.44 | 8.81 | 274.75 | 68.31 | 71.87 | 18.99 |
| Syntax | 121 | 288.28 | 206.43 | 12.12 | 276.16 | 69.73 | 71.52 | 19.01 |

Babel init includes module loading, the original empty-source warmup, and helper loading.
Subtracted totals are accounting residuals, not measured Babel-disabled runs or pure execution time.
Source-transform attempts that throw are timed; transform failure counts are in summary.json.
Body execution timers can overlap dynamic transforms and are not additive with these phases.

Verdict changes versus unprofiled control: 0.
Missing/incomplete phase measurements: 0.
See summary.json for successful-only means, errors, and repeat consistency.
