#!/bin/sh
# Regenerate .out files for all regression trace suites.
# Usage: ./update-regression-trace.sh [pattern]
#   pattern: optional glob/substring to filter test names

set -e

export DYNAJS_HOME="${DYNAJS_HOME:-$(pwd)}"

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
    find "$suite_dir" -type f \( -name '*.js' -o -name '*.cjs' -o -name '*.mjs' \) \
        ! -name '*__dynajs__.js' \
        ! -name '*__dynajs__.cjs' \
        ! -name '*__dynajs__.mjs' | sort > "$SUITE_TMP_FILE"
    while IFS= read -r js_file; do
        out_file="${js_file%.*}.out"

        if [ -n "$PATTERN" ]; then
            case "$js_file" in *"$PATTERN"*) ;; *) continue ;; esac
        fi

        if grep -Fq "\"$js_file\"" ./tests/expected_exit_codes; then
            echo "  skipped: $js_file"
            continue
        fi

        if output=$(DYNAJS_OPTIONS="--analysis=$analysis --partial --pos persist" ./dynajs node "$js_file" 2>/dev/null); then
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
