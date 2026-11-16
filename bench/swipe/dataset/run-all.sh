#!/bin/bash
# DSE on every page that loads in Passive mode, both instrumenters, interleaved
# so the two versions see the same machine load.  run-all.sh [budget] [parallel]
budget=${1:-900}; par=${2:-6}
cd ~/swipe
awk '$2=="ok"{print $1}' results/passive-classes.txt | while read id; do
  echo "jalangi $id"; echo "dynajs $id"
done | xargs -P $par -L 1 bash -c 'dynajs/dataset/run-page.sh $0 $1 '"$budget"
