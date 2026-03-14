#!/bin/sh
# Regenerate .out files for all tests in tests/basic/
# Usage: ./update-tests.sh [pattern]
#   pattern: optional glob/substring to filter test names (e.g. "arrow" or "function-1")

set -e

npm run build

PATTERN="${1:-}"
UPDATED=0
FAILED=0

for js_file in tests/basic/**/*.js tests/basic/*.js; do
    [ -f "$js_file" ] || continue
    # skip instrumented files
    case "$js_file" in *__dynajs__*) continue ;; esac

    out_file="${js_file%.js}.out"

    # apply optional filter
    if [ -n "$PATTERN" ]; then
        case "$js_file" in *"$PATTERN"*) ;; *) continue ;; esac
    fi

    if output=$(./dynajs analyze --full -a samples/TraceAll.js "$js_file" 2>/dev/null); then
        printf '%s\n' "$output" > "$out_file"
        echo "  updated: $out_file"
        UPDATED=$((UPDATED + 1))
    else
        echo "  FAILED:  $js_file" >&2
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "Done. Updated: $UPDATED, Failed: $FAILED"
