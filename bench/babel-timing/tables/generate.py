"""Regenerate the LaTeX table from the recorded measurement summary."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
groups = json.loads((root / 'results-20260926/summary.json').read_text())['groups']
lines = [r'''% Generated from bench/babel-timing/results-20260926/summary.json.
% Requires: \usepackage{booktabs,multirow}
\begin{table*}[t]
  \centering
  \caption{Runtime breakdown of the taint microbenchmarks.
  Times are means in milliseconds over three fresh-process runs per case,
  after one discarded run; failed executions are included.
  Babel initialization and source transpilation are measured separately.}
  \label{tab:taint-transpilation-time}
  \setlength{\tabcolsep}{4pt}
  \renewcommand{\arraystretch}{1.05}
  \begin{tabular}{lrrrrrrrr}
    \toprule
    \multirow{2}{*}{Category} & \multirow{2}{*}{Cases}
      & \multicolumn{5}{c}{NodeMedic-FINE}
      & \multirow{2}{*}{\shortstack{DynaJS\\total}}
      & \multirow{2}{*}{\shortstack{Node\\total}} \\
    \cmidrule(lr){3-7}
      & & Total & \shortstack{Babel\\init.}
      & Transpile & Remaining & \shortstack{Babel\\(\%)} & & \\
    \midrule''']
for index, name in enumerate(('ES5', 'ES6+', 'Built-ins', 'Syntax', 'Overall')):
    if index in (2, 4):
        lines.append(r'    \midrule')
    group = groups[name]
    m = group['means_ms']
    values = [m['elapsed_ms'], m['init_ms'], m['transform_ms'], m['total_minus_babel_ms']]
    row = [name, str(group['quality']['cases'])] + [f'{v:.2f}' for v in values]
    row += [f"{group['babel_share_percent']:.1f}"]
    row += [f"{group['reference'][r]['mean_ms']:.2f}" for r in ('dynajs-ta', 'baseline')]
    lines.append('    ' + ' & '.join(row) + r' \\')
lines.append(r'''    \bottomrule
  \end{tabular}
  \par\smallskip
  \begin{minipage}{\textwidth}
    \footnotesize
    \emph{Babel init.} includes module loading, the existing empty-source
    warmup (including preset/plugin loading), and helper loading.
    \emph{Transpile} measures source-transformation attempts, including
    failed attempts and their error handling.
    \emph{Remaining} is Total minus Babel init.\ and Transpile; it includes
    process startup, Jalangi instrumentation, analysis setup, execution,
    and shutdown. It is an accounting residual, not a measured Babel-disabled
    runtime or pure execution time.
    \emph{Babel (\%)} is the combined initialization and transpilation time
    divided by Total, computed before rounding.
    All tools were measured on the same host with Node v24.14.1.
  \end{minipage}
\end{table*}
''')
(root / 'tables/taint-transpilation-time.tex').write_text('\n'.join(lines))
