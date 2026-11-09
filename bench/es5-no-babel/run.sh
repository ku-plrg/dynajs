#!/usr/bin/env bash
# Run sequentially so the timing conditions do not contend with each other.
set -euo pipefail
: "${NODEMEDIC_HOME:?Set NODEMEDIC_HOME to the configured NodeMedic checkout}"
exp=$(cd "$1" && pwd)
reps=${REPS:-5}
warmup=${WARMUP:-1}
for condition in babel-on babel-off reference; do
  if [[ "$condition" == reference ]]; then
    runners=(--runner baseline --runner dynajs-ta)
  else
    runners=(--runner nodemedic)
    export ES5_JALANGI_CMD="$exp/jalangi-$condition/src/js/commands/jalangi.js"
  fi
  echo "Starting $condition: $(date -Is)"
  node "$exp/run-es5.mjs" --done "${runners[@]}" --reps "$reps" --warmup "$warmup" \
    --output-dir "$exp/measured-$condition" > "$exp/measured-$condition.log" 2>&1
  echo "Finished $condition: $(date -Is)"
done
echo COMPLETE
