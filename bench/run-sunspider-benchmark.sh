#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

ANALYSES=(
  "samples/BranchCoverage.js"
  "samples/CheckNaN.js"
  "samples/EmptyAnalysis.js"
  "samples/HierarchyDemo.js"
  "samples/LogLoadStore.js"
  "samples/TraceAll.js"
)

MODES=("full" "partial" "baseline")
BENCHMARK_DIR="bench/sunspider"
OUTPUT_DIR=""
FILTER_ANALYSES=()
FILTER_MODES=()
FILTER_BENCHES=()

usage() {
  cat <<'EOF'
Usage: bench/run-sunspider-benchmark.sh [options]

Runs the SunSpider suite with the selected analyses and hook modes.
For each run it stores stdout/stderr in a log directory and prints:
  mode, analysis, benchmark, exit status, elapsed time, stdout/stderr sizes

Options:
  --analysis NAME   Run only analyses matching NAME or NAME.js (repeatable)
  --mode MODE       Run only one mode: full, partial, or baseline (repeatable)
  --bench NAME      Run only benchmarks matching NAME or NAME.cjs (repeatable)
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

while [[ $# -gt 0 ]]; do
  case "$1" in
    --analysis)
      [[ $# -ge 2 ]] || die "--analysis requires a value"
      FILTER_ANALYSES+=("$2")
      shift 2
      ;;
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

mapfile -t BENCHMARKS < <(find "$BENCHMARK_DIR" -maxdepth 1 -type f -name '*.cjs' | sort)
[[ ${#BENCHMARKS[@]} -gt 0 ]] || die "no benchmarks found under $BENCHMARK_DIR"

if [[ ${#FILTER_ANALYSES[@]} -gt 0 ]]; then
  filtered=()
  for analysis in "${ANALYSES[@]}"; do
    if matches_filter "$(basename "$analysis")" "${FILTER_ANALYSES[@]}"; then
      filtered+=("$analysis")
    fi
  done
  ANALYSES=("${filtered[@]}")
fi

if [[ ${#FILTER_MODES[@]} -gt 0 ]]; then
  filtered=()
  for mode in "${MODES[@]}"; do
    if matches_filter "$mode" "${FILTER_MODES[@]}"; then
      filtered+=("$mode")
    fi
  done
  MODES=("${filtered[@]}")
fi

if [[ ${#FILTER_BENCHES[@]} -gt 0 ]]; then
  filtered=()
  for bench in "${BENCHMARKS[@]}"; do
    if matches_filter "$(basename "$bench")" "${FILTER_BENCHES[@]}"; then
      filtered+=("$bench")
    fi
  done
  BENCHMARKS=("${filtered[@]}")
fi

[[ ${#MODES[@]} -gt 0 ]] || die "no modes matched the requested filters"
[[ ${#BENCHMARKS[@]} -gt 0 ]] || die "no benchmarks matched the requested filters"

needs_analysis=0
for mode in "${MODES[@]}"; do
  if [[ "$mode" != "baseline" ]]; then
    needs_analysis=1
    break
  fi
done
if [[ $needs_analysis -eq 1 && ${#ANALYSES[@]} -eq 0 ]]; then
  die "no analyses matched the requested filters"
fi

if [[ -z "$OUTPUT_DIR" ]]; then
  timestamp=$(date '+%Y%m%d-%H%M%S')
  OUTPUT_DIR="$REPO_ROOT/bench/results/sunspider-$timestamp"
fi

mkdir -p "$OUTPUT_DIR/logs"
CSV_FILE="$OUTPUT_DIR/results.csv"

cat > "$CSV_FILE" <<'EOF'
mode,analysis,benchmark,exit_code,elapsed_ms,stdout_lines,stdout_bytes,stderr_lines,stderr_bytes,stdout_file,stderr_file
EOF

printf 'Output directory: %s\n' "$OUTPUT_DIR"
total_runs=0
for mode in "${MODES[@]}"; do
  if [[ "$mode" == "baseline" ]]; then
    total_runs=$((total_runs + ${#BENCHMARKS[@]}))
  else
    total_runs=$((total_runs + (${#ANALYSES[@]} * ${#BENCHMARKS[@]})))
  fi
done
printf 'Selected analyses: %d\n' "${#ANALYSES[@]}"
printf 'Selected modes: %d\n' "${#MODES[@]}"
printf 'Selected benchmarks: %d\n' "${#BENCHMARKS[@]}"
printf 'Planned runs: %d\n' "$total_runs"
printf '\n'
printf '%-8s %-18s %-28s %6s %10s %12s %12s\n' \
  "mode" "analysis" "benchmark" "exit" "time_ms" "stdout_B" "stderr_B"

for mode in "${MODES[@]}"; do
  if [[ "$mode" == "baseline" ]]; then
    mode_analyses=("baseline")
  else
    mode_analyses=("${ANALYSES[@]}")
  fi

  for analysis in "${mode_analyses[@]}"; do
    if [[ "$mode" == "baseline" ]]; then
      analysis_name="baseline"
    else
      analysis_name=$(strip_ext "$(basename "$analysis")")
    fi
    for bench in "${BENCHMARKS[@]}"; do
      bench_name=$(strip_ext "$(basename "$bench")")
      prefix="${mode}__${analysis_name}__${bench_name}"
      stdout_file="$OUTPUT_DIR/logs/${prefix}.stdout"
      stderr_file="$OUTPUT_DIR/logs/${prefix}.stderr"

      start_ms=$(now_ms)
      set +e
      if [[ "$mode" == "baseline" ]]; then
        node "$bench" >"$stdout_file" 2>"$stderr_file"
        exit_code=$?
      elif [[ "$mode" == "partial" ]]; then
        DYNAJS_ANALYSIS="$analysis" DYNAJS_PARTIAL_HOOK=1 ./dynajs node "$bench" >"$stdout_file" 2>"$stderr_file"
        exit_code=$?
      else
        DYNAJS_ANALYSIS="$analysis" ./dynajs node "$bench" >"$stdout_file" 2>"$stderr_file"
        exit_code=$?
      fi
      set -e
      end_ms=$(now_ms)

      elapsed_ms=$((end_ms - start_ms))
      stdout_lines=$(wc -l < "$stdout_file" | trim_spaces)
      stdout_bytes=$(wc -c < "$stdout_file" | trim_spaces)
      stderr_lines=$(wc -l < "$stderr_file" | trim_spaces)
      stderr_bytes=$(wc -c < "$stderr_file" | trim_spaces)

      printf '%-8s %-18s %-28s %6d %10d %12d %12d\n' \
        "$mode" "$analysis_name" "$bench_name" "$exit_code" "$elapsed_ms" "$stdout_bytes" "$stderr_bytes"

      printf '%s,%s,%s,%d,%d,%d,%d,%d,%d,%s,%s\n' \
        "$mode" "$analysis_name" "$bench_name" "$exit_code" "$elapsed_ms" \
        "$stdout_lines" "$stdout_bytes" "$stderr_lines" "$stderr_bytes" \
        "$stdout_file" "$stderr_file" >> "$CSV_FILE"
    done
  done
done

printf '\nSummary by mode + analysis:\n'
awk -F',' '
  NR == 1 { next }
  {
    key = $1 "," $2
    runs[key]++
    ok[key] += ($4 == 0)
    time_ms[key] += $5
    stdout_bytes[key] += $7
    stderr_bytes[key] += $9
  }
  END {
    printf "%-8s %-18s %6s %6s %12s %14s %14s\n", "mode", "analysis", "runs", "ok", "total_ms", "stdout_B", "stderr_B"
    for (key in runs) {
      split(key, parts, ",")
      printf "%-8s %-18s %6d %6d %12d %14d %14d\n",
        parts[1], parts[2], runs[key], ok[key], time_ms[key], stdout_bytes[key], stderr_bytes[key]
    }
  }
' "$CSV_FILE"

printf '\nFailures:\n'
awk -F',' '
  BEGIN {
    printf "%-8s %-18s %-28s %6s %10s %12s %12s\n",
      "mode", "analysis", "benchmark", "exit", "time_ms", "stdout_B", "stderr_B"
  }
  NR == 1 { next }
  $4 != 0 {
    printf "%-8s %-18s %-28s %6d %10d %12d %12d\n",
      $1, $2, $3, $4, $5, $7, $9
    failures++
  }
  END {
    if (failures == 0) {
      print "(none)"
    }
  }
' "$CSV_FILE"

printf '\nCSV: %s\n' "$CSV_FILE"
