#!/bin/bash
# SWIPE's confirmation step for a fair comparison: revisit every URL a DSE run
# generated, in Passive mode (no instrumentation: try-alternative-paths=false
# routes Chrome through the uninstrumented proxy, no DSE), so only flows of the
# page itself are counted — none created by Jalangi's or DynaJS's own code.
#   confirm-all.sh <src-mode> [parallel]      e.g. confirm-all.sh dynajs-mod 6
# Needs results/dse-urls/<src-mode>/<id>.txt (summarize.py writes them).
# The time budget (3600 s) only has to cover visiting every URL once.
# Results: results/passive-of-<src-mode>/<id>/
src=$1; par=${2:-6}
cd ~/swipe
for f in results/dse-urls/$src/*.txt; do
  [ -s "$f" ] && echo "$(basename $f .txt) $f"
done | xargs -P $par -L 1 bash -c \
  'TAG=-of-'"$src"' TARGETS=$1 EXTRA_JQ='"'"'."try-alternative-paths"=false'"'"' dynajs/dataset/run-page.sh passive $0 3600'
