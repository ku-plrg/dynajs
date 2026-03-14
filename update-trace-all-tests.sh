#!/bin/sh
# Regenerate .out files for all tests in tests/regression-trace/trace-all/
# Usage: ./update-trace-all-tests.sh [pattern]
#   pattern: optional glob/substring to filter test names (e.g. "arrow" or "function-1")

set -e

npm run build

PATTERN="${1:-}"
UPDATED=0
FAILED=0
TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

find tests/regression-trace/trace-all -name '*.js' ! -name '*__dynajs__.js' | sort > "$TMP_FILE"

while IFS= read -r js_file; do
    out_file="${js_file%.js}.out"

    # apply optional filter
    if [ -n "$PATTERN" ]; then
        case "$js_file" in *"$PATTERN"*) ;; *) continue ;; esac
    fi

    if output=$(node --require ./tests/harness.js ./dynajs analyze --partial -a samples/TraceAll.js "$js_file" 2>/dev/null); then
        printf '%s\n' "$output" > "$out_file"
        echo "  updated: $out_file"
        UPDATED=$((UPDATED + 1))
    else
        echo "  FAILED:  $js_file" >&2
        FAILED=$((FAILED + 1))
    fi
done < "$TMP_FILE"

echo ""
echo "Done. Updated: $UPDATED, Failed: $FAILED"
