#!/bin/sh
# Regenerate .out files for all regression trace suites.
# Usage: ./update-regression-trace.sh [pattern]
#   pattern: optional glob/substring to filter test names

set -e

npm run build

PATTERN="${1:-}"
UPDATED=0
FAILED=0
TMP_FILE="$(mktemp)"
SUITE_TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE" "$SUITE_TMP_FILE"' EXIT

cat <<'EOF' > "$TMP_FILE"
tests/regression-trace/hierarchy samples/HierarchyDemo.js
tests/regression-trace/trace-all samples/TraceAll.js
tests/regression-trace/compare-some samples/CompareSome.js
EOF

while read -r suite_dir analysis; do
    find "$suite_dir" -name '*.js' ! -name '*__dynajs__.js' | sort > "$SUITE_TMP_FILE"
    while IFS= read -r js_file; do
        out_file="${js_file%.js}.out"

        if [ -n "$PATTERN" ]; then
            case "$js_file" in *"$PATTERN"*) ;; *) continue ;; esac
        fi

        if grep -Fq "\"$js_file\"" ./tests/expected_exit_codes; then
            echo "  skipped: $js_file"
            continue
        fi

        if output=$(node --require ./tests/harness.js ./dynajs analyze --full -a "$analysis" "$js_file" 2>/dev/null); then
            printf '%s\n' "$output" > "$out_file"
            echo "  updated: $out_file"
            UPDATED=$((UPDATED + 1))
        else
            echo "  FAILED:  $js_file" >&2
            FAILED=$((FAILED + 1))
        fi
    done < "$SUITE_TMP_FILE"
done < "$TMP_FILE"

echo ""
echo "Done. Updated: $UPDATED, Failed: $FAILED"
