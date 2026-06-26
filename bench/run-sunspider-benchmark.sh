#!/usr/bin/env bash

set -euo pipefail

# Runs the SunSpider suite under several runners and prints a benchmark x runner
# matrix (like `npm run microbench`, but SunSpider has no taint/concolic oracle):
#
#   node            plain `node bench.cjs`               -- the correctness oracle
#   noop            analyses/dist/Noop.mjs (--partial)   -- bare instrumentation cost
#   taint           analyses/dist/Taint.mjs  (--partial --pos persist)
#   concolic        analyses/dist/Concolic.mjs (--partial)
#   TraceAllSilent  samples/TraceAllSilent.js (--partial) -- every hook, no stdout
#   CheckNaN        samples/CheckNaN.js (--partial)       -- reports NaN sites
#
# Each cell is a status + elapsed time. A runner is `fail` on a non-zero exit or
# `t/o` on timeout. For TRANSPARENT runners (node, taint, concolic,
# TraceAllSilent) whose stdout should reproduce node's exactly, `ok` means the
# stdout is byte-identical to node's and `diff` means it diverged (an info-loss /
# soundness or instrumentation bug surfacing as a wrong value). DIAGNOSTIC
# runners (CheckNaN) intentionally emit extra output, so they are scored on exit
# status alone (`ok` = ran) -- their findings live in the per-run logs.

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

# Runner registry. taint/concolic flags mirror bench/run-micro-benchmark.mjs
# TYPE_CONFIG so the matrix runs each analysis exactly as the microbench suite
# does; the samples reuse the same --partial scoping (instrument the bench only).
NOOP_ANALYSIS="$REPO_ROOT/analyses/dist/Noop.mjs"
TAINT_ANALYSIS="$REPO_ROOT/analyses/dist/Taint.mjs"
CONCOLIC_ANALYSIS="$REPO_ROOT/analyses/dist/Concolic.mjs"
TRACE_ANALYSIS="$REPO_ROOT/samples/TraceAllSilent.js"
CHECKNAN_ANALYSIS="$REPO_ROOT/samples/CheckNaN.js"
ALL_MODES=("node" "noop" "taint" "concolic" "TraceAllSilent" "CheckNaN")

# DYNAJS_OPTIONS for a runner (empty for plain node).
mode_options() {
  case "$1" in
    noop) printf -- '--analysis=%s --partial' "$NOOP_ANALYSIS" ;;
    taint) printf -- '--analysis=%s --partial --pos persist' "$TAINT_ANALYSIS" ;;
    concolic) printf -- '--analysis=%s --partial' "$CONCOLIC_ANALYSIS" ;;
    TraceAllSilent) printf -- '--analysis=%s --partial' "$TRACE_ANALYSIS" ;;
    CheckNaN) printf -- '--analysis=%s --partial' "$CHECKNAN_ANALYSIS" ;;
  esac
}

# Analysis file backing a runner (empty for plain node), for the build check.
mode_analysis_file() {
  case "$1" in
    noop) printf '%s' "$NOOP_ANALYSIS" ;;
    taint) printf '%s' "$TAINT_ANALYSIS" ;;
    concolic) printf '%s' "$CONCOLIC_ANALYSIS" ;;
    TraceAllSilent) printf '%s' "$TRACE_ANALYSIS" ;;
    CheckNaN) printf '%s' "$CHECKNAN_ANALYSIS" ;;
  esac
}

# Transparent runners must reproduce node's stdout, so they are diff-scored
# against the node oracle. Diagnostic runners (CheckNaN) are scored on exit only.
mode_transparent() {
  case "$1" in
    node | noop | taint | concolic | TraceAllSilent) return 0 ;;
    *) return 1 ;;
  esac
}

BENCHMARK_DIR="bench/sunspider"
OUTPUT_DIR=""
TIMEOUT="120"
FILTER_MODES=()
FILTER_BENCHES=()

usage() {
  cat <<'EOF'
Usage: bench/run-sunspider-benchmark.sh [options]

Runs the SunSpider suite under each runner (node, noop, taint, concolic,
TraceAllSilent, CheckNaN) and prints a benchmark x runner matrix of status +
elapsed time. `node` is the correctness oracle: transparent runners are `ok`
when their stdout matches node and `diff` when it diverges; CheckNaN is scored
on exit status only.

Options:
  --mode MODE       Show only this runner: node, noop, taint, concolic,
                    TraceAllSilent, or CheckNaN (repeatable)
  --bench NAME      Run only benchmarks matching NAME or NAME.cjs (repeatable)
  --timeout SECONDS Per-run wall-clock limit (default 120; 0 disables)
  --output-dir DIR  Write logs and CSV into DIR
  --help            Show this help
EOF
}

die() {
  echo "error: $*" >&2
  exit 1
}

now_ms() {
  perl -MTime::HiRes=time -e 'printf "%.0f\n", time() * 1000'
}

trim_spaces() {
  awk '{print $1}'
}

strip_ext() {
  local value="$1"
  value="${value%.js}"
  value="${value%.cjs}"
  printf '%s\n' "$value"
}

matches_filter() {
  local value="$1"
  shift
  local value_stem
  value_stem=$(strip_ext "$value")
  local filter
  for filter in "$@"; do
    local filter_stem
    filter_stem=$(strip_ext "$filter")
    if [[ "$value" == "$filter" || "$value_stem" == "$filter_stem" ]]; then
      return 0
    fi
  done
  return 1
}

in_list() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    [[ "$item" == "$needle" ]] && return 0
  done
  return 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      [[ $# -ge 2 ]] || die "--mode requires a value"
      FILTER_MODES+=("$2")
      shift 2
      ;;
    --bench)
      [[ $# -ge 2 ]] || die "--bench requires a value"
      FILTER_BENCHES+=("$2")
      shift 2
      ;;
    --timeout)
      [[ $# -ge 2 ]] || die "--timeout requires a value"
      TIMEOUT="$2"
      shift 2
      ;;
    --output-dir)
      [[ $# -ge 2 ]] || die "--output-dir requires a value"
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      die "unknown option: $1"
      ;;
  esac
done

cd "$REPO_ROOT"
export DYNAJS_HOME="${DYNAJS_HOME:-$REPO_ROOT}"

# Which runners to display. We always RUN node (it is the diff oracle), but only
# show columns for the selected modes.
DISPLAY_MODES=("${ALL_MODES[@]}")
if [[ ${#FILTER_MODES[@]} -gt 0 ]]; then
  DISPLAY_MODES=()
  for mode in "${ALL_MODES[@]}"; do
    if matches_filter "$mode" "${FILTER_MODES[@]}"; then
      DISPLAY_MODES+=("$mode")
    fi
  done
  [[ ${#DISPLAY_MODES[@]} -gt 0 ]] || die "no runners matched --mode (valid: ${ALL_MODES[*]})"
fi

# Runners we actually execute: the displayed ones, plus node when any displayed
# transparent runner needs it as the diff oracle.
RUN_MODES=("${DISPLAY_MODES[@]}")
if ! in_list "node" "${RUN_MODES[@]}"; then
  for mode in "${DISPLAY_MODES[@]}"; do
    if mode_transparent "$mode"; then
      RUN_MODES=("node" "${RUN_MODES[@]}")
      break
    fi
  done
fi

# A backing analysis file must exist before we try to run it.
for mode in "${RUN_MODES[@]}"; do
  analysis_file=$(mode_analysis_file "$mode")
  if [[ -n "$analysis_file" && ! -f "$analysis_file" ]]; then
    die "missing analysis for '$mode': $analysis_file -- run \`npm run build\` first"
  fi
done

mapfile -t BENCHMARKS < <(find "$BENCHMARK_DIR" -maxdepth 1 -type f -name '*.cjs' | sort)
[[ ${#BENCHMARKS[@]} -gt 0 ]] || die "no benchmarks found under $BENCHMARK_DIR"

if [[ ${#FILTER_BENCHES[@]} -gt 0 ]]; then
  filtered=()
  for bench in "${BENCHMARKS[@]}"; do
    if matches_filter "$(basename "$bench")" "${FILTER_BENCHES[@]}"; then
      filtered+=("$bench")
    fi
  done
  BENCHMARKS=("${filtered[@]}")
fi
[[ ${#BENCHMARKS[@]} -gt 0 ]] || die "no benchmarks matched --bench"

# timeout(1) prefix; empty when disabled or unavailable.
TIMEOUT_PREFIX=()
if [[ "$TIMEOUT" != "0" ]] && command -v timeout >/dev/null 2>&1; then
  TIMEOUT_PREFIX=(timeout "$TIMEOUT")
fi

# Colors, only on a tty.
if [[ -t 1 ]]; then
  C_GREEN=$'\033[32m'
  C_RED=$'\033[31m'
  C_YELLOW=$'\033[33m'
  C_DIM=$'\033[2m'
  C_BOLD=$'\033[1m'
  C_RESET=$'\033[0m'
else
  C_GREEN="" C_RED="" C_YELLOW="" C_DIM="" C_BOLD="" C_RESET=""
fi

color_for_status() {
  case "$1" in
    ok) printf '%s' "$C_GREEN" ;;
    diff) printf '%s' "$C_YELLOW" ;;
    *) printf '%s' "$C_RED" ;;
  esac
}

if [[ -z "$OUTPUT_DIR" ]]; then
  timestamp=$(date '+%Y%m%d-%H%M%S')
  OUTPUT_DIR="$REPO_ROOT/bench/results/sunspider-$timestamp"
fi
mkdir -p "$OUTPUT_DIR/logs"
CSV_FILE="$OUTPUT_DIR/results.csv"
cat > "$CSV_FILE" <<'EOF'
mode,benchmark,exit_code,status,elapsed_ms,stdout_lines,stdout_bytes,stderr_lines,stderr_bytes,stdout_file,stderr_file
EOF

printf 'Output directory: %s\n' "$OUTPUT_DIR"
printf 'Runners: %s\n' "${DISPLAY_MODES[*]}"
printf 'Benchmarks: %d\n' "${#BENCHMARKS[@]}"
printf 'Timeout: %s\n\n' "$([[ ${#TIMEOUT_PREFIX[@]} -gt 0 ]] && echo "${TIMEOUT}s" || echo "disabled")"

# Run one (mode, bench); writes stdout/stderr to the given files and echoes the
# exit code. Timeout-killed runs come back as 124.
run_one() {
  local mode="$1" bench="$2" so="$3" se="$4"
  set +e
  if [[ "$mode" == "node" ]]; then
    "${TIMEOUT_PREFIX[@]}" node "$bench" >"$so" 2>"$se"
  else
    DYNAJS_OPTIONS="$(mode_options "$mode")" \
      "${TIMEOUT_PREFIX[@]}" ./dynajs node "$bench" >"$so" 2>"$se"
  fi
  local code=$?
  set -e
  return $code
}

# Matrix header.
cell_w=16
header=$(printf '%-30s' "benchmark")
for mode in "${DISPLAY_MODES[@]}"; do
  header+=$(printf ' %-*s' "$cell_w" "$mode")
done
printf '%s%s%s\n' "$C_BOLD" "$header" "$C_RESET"

for bench in "${BENCHMARKS[@]}"; do
  bench_name=$(strip_ext "$(basename "$bench")")
  node_stdout="$OUTPUT_DIR/logs/node__${bench_name}.stdout"

  declare -A status_of elapsed_of
  for mode in "${RUN_MODES[@]}"; do
    so="$OUTPUT_DIR/logs/${mode}__${bench_name}.stdout"
    se="$OUTPUT_DIR/logs/${mode}__${bench_name}.stderr"

    start_ms=$(now_ms)
    run_one "$mode" "$bench" "$so" "$se" && code=0 || code=$?
    end_ms=$(now_ms)
    elapsed_ms=$((end_ms - start_ms))

    if [[ $code -eq 124 ]]; then
      status="t/o"
    elif [[ $code -ne 0 ]]; then
      status="fail"
    elif [[ "$mode" == "node" ]] || ! mode_transparent "$mode"; then
      # node oracle, or a diagnostic runner scored on exit alone.
      status="ok"
    elif [[ "${status_of[node]:-}" == "ok" ]] && cmp -s "$so" "$node_stdout"; then
      status="ok"
    else
      # node crashed (no oracle) or output mismatched.
      status="diff"
    fi
    status_of[$mode]="$status"
    elapsed_of[$mode]="$elapsed_ms"

    stdout_lines=$(wc -l < "$so" | trim_spaces)
    stdout_bytes=$(wc -c < "$so" | trim_spaces)
    stderr_lines=$(wc -l < "$se" | trim_spaces)
    stderr_bytes=$(wc -c < "$se" | trim_spaces)
    printf '%s,%s,%d,%s,%d,%d,%d,%d,%d,%s,%s\n' \
      "$mode" "$bench_name" "$code" "$status" "$elapsed_ms" \
      "$stdout_lines" "$stdout_bytes" "$stderr_lines" "$stderr_bytes" \
      "$so" "$se" >> "$CSV_FILE"
  done

  row=$(printf '%-30s' "$bench_name")
  for mode in "${DISPLAY_MODES[@]}"; do
    status="${status_of[$mode]}"
    elapsed_ms="${elapsed_of[$mode]}"
    color=$(color_for_status "$status")
    cell=$(printf '%-5s %8sms' "$status" "$elapsed_ms")
    row+=$(printf ' %s%-*s%s' "$color" "$cell_w" "$cell" "$C_RESET")
  done
  printf '%s\n' "$row"

  unset status_of elapsed_of
done

# Per-runner summary.
printf '\n%sSummary by runner:%s\n' "$C_BOLD" "$C_RESET"
printf '%-16s %6s %6s %6s %6s %6s %12s %10s\n' \
  "runner" "runs" "ok" "diff" "fail" "t/o" "total_ms" "mean_ms"
for mode in "${DISPLAY_MODES[@]}"; do
  awk -F',' -v mode="$mode" '
    NR == 1 { next }
    $1 == mode {
      runs++
      total_ms += $5
      if ($4 == "ok") ok++
      else if ($4 == "diff") diff++
      else if ($4 == "t/o") to++
      else fail++
    }
    END {
      printf "%-16s %6d %6d %6d %6d %6d %12d %10s\n",
        mode, runs, ok, diff, fail, to, total_ms,
        (runs ? sprintf("%.1f", total_ms / runs) : "0")
    }
  ' "$CSV_FILE"
done

# Non-ok runs (skip the node oracle's own status -- node failures show as the
# instrumented runners' missing oracle).
printf '\n%sNon-ok runs:%s\n' "$C_BOLD" "$C_RESET"
awk -F',' '
  NR == 1 { next }
  $4 != "ok" {
    printf "  %-16s %-28s %-6s exit=%s %sms\n", $1, $2, $4, $3, $5
    n++
  }
  END { if (!n) print "  (none)" }
' "$CSV_FILE"

printf '\nCSV: %s\n' "$CSV_FILE"
