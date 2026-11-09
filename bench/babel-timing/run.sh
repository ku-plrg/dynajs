#!/usr/bin/env bash
set -euo pipefail
: "${NODEMEDIC_HOME:?Set NODEMEDIC_HOME}"
exp=$(cd "$1" && pwd)
reps=${REPS:-3}
warmup=${WARMUP:-1}
printf 'reps=%s\nwarmup=%s\n' "$reps" "$warmup" > "$exp/run-config.txt"
for condition in control profile reference; do
  runners=(--runner nodemedic)
  count=$reps
  warm=$warmup
  if [[ "$condition" == reference ]]; then
    runners=(--runner baseline --runner dynajs-ta)
  else
    export BABEL_TIMING_JALANGI_CMD="$exp/jalangi-$condition/src/js/commands/jalangi.js"
  fi
  # One full unprofiled pass verifies that timing instrumentation preserves verdicts.
  if [[ "$condition" == control ]]; then count=1; warm=0; fi
  echo "Starting $condition: $(date -Is)"
  node "$exp/runner.mjs" --done "${runners[@]}" --reps "$count" --warmup "$warm" \
    --output-dir "$exp/$condition" > "$exp/$condition.log" 2>&1
  echo "Finished $condition: $(date -Is)"
done
echo COMPLETE
