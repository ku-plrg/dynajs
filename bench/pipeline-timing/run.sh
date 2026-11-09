#!/usr/bin/env bash
set -euo pipefail
: "${NODEMEDIC_HOME:?Set NODEMEDIC_HOME}"
exp=$(cd "$1" && pwd)
export DYNAJS_HOME="$exp/dynajs-profile"
export BABEL_TIMING_JALANGI_CMD="$exp/jalangi-profile/src/js/commands/jalangi.js"
export NODE_OPTIONS="--require=$exp/runtime.cjs"
reps=${REPS:-3}
warmup=${WARMUP:-1}
printf 'reps=%s\nwarmup=%s\n' "$reps" "$warmup" > "$exp/run-config.txt"
echo "Starting: $(date -Is)"
node "$exp/runner.mjs" --done --runner baseline --runner dynajs-ta --runner nodemedic \
  --reps "$reps" --warmup "$warmup" --output-dir "$exp/measured" > "$exp/measured.log" 2>&1
echo "Finished: $(date -Is)"
python3 "$(dirname "${BASH_SOURCE[0]}")/summarize.py" "$exp"
echo COMPLETE
