#!/bin/bash
# Run SWIPE DSE in replay mode on one prepared dataset page (on a5).
#   run-page.sh <jalangi|dynajs|dynajs-b> <id> [dse-budget-seconds]
# env: EXTRA_JQ   extra jq filter applied to the config (e.g. '."browser_timeout"=300')
#      TAG        results subdirectory suffix (results/<mode><TAG>/<id>)
#      TARGETS    target-URL file to use instead of dataset/<id>/target.txt
#      DYNAJS_ANALYSIS  analysis bundle in dist/ instead of the mode default
#      DYNAJS_HOOKS=full  instrument every DynaJS hook (default: partial mode)
# Inputs:  ~/swipe/dataset/<id>/{target.txt,output/}   (from prep.py)
# Results: ~/swipe/results/<mode>/<id>/{output.txt,run.log,stats.json,...}
set -u
mode=$1; id=$2; budget=${3:-900}
S=~/swipe
R=$S/results/$mode${TAG:-}/$id
rm -rf "$R"; mkdir -p "$R/output"; chmod 777 "$R" "$R/output"
cp -a $S/dataset/$id/output/. "$R/output/"
chmod -R a+rw "$R/output"
jq --argjson b "$budget" '
  ."run-ui-fuzzer"=false | ."try-alternative-paths"=true |
  ."mitmproxy-archivemode"=false | ."mitmproxy-replaymode"=true | ."mitmproxy-appendmode"=false |
  ."dse-time-budget"=$b | '"${EXTRA_JQ:-.}" $S/SWIPE/scripts/swipe/config/config.json > "$R/config.json"
cp "${TARGETS:-$S/dataset/$id/target.txt}" "$R/target.txt"
image=swipe; { [ "$mode" = dynajs ] || [ "$mode" = dynajs-b ]; } && image=swipe-dynajs
name=swipe-$mode${TAG:-}-$id
docker rm -f $name >/dev/null 2>&1
start=$(date +%s.%N)
docker run --name $name --add-host swipe.test:127.0.0.1 -e PYTHONUNBUFFERED=1 -e DYNAJS_HOOKS=${DYNAJS_HOOKS:-} -e DYNAJS_ANALYSIS=${DYNAJS_ANALYSIS:-} \
  -v $S:/host:ro -v $S/dynajs:/dynajs:ro \
  -v "$R/output":/home/scan/jalangi2-workspace/scripts/swipe/output \
  -v "$R":/run-in:ro \
  --entrypoint bash $image /host/run-swipe.sh $mode /run-in/config.json /run-in/target.txt \
  > "$R/run.log" 2>&1 &
cid=$!
# peak memory of the whole container (browser + proxies + solver), sampled every 2s
peak=0
while kill -0 $cid 2>/dev/null; do
  m=$(docker stats --no-stream --format '{{.MemUsage}}' $name 2>/dev/null | awk '{print $1}')
  b=$(numfmt --from=iec-i ${m%B} </dev/null 2>/dev/null || echo 0)
  [ "${b:-0}" -gt "$peak" ] && peak=$b
  sleep 2
done
wait $cid; rc=$?
secs=$(echo "$(date +%s.%N) - $start" | bc)
for f in /home/scan/jalangi2-workspace/scripts/swipe/output.txt /tmp/dynajs-instrument.jsonl /tmp/dynajs-trace.jsonl /tmp/urls_to_confirm.txt; do
  docker cp $name:$f "$R/" >/dev/null 2>&1
done
docker rm $name >/dev/null 2>&1
printf '{"mode":"%s","id":"%s","exit":%d,"seconds":%s,"peak_mem_bytes":%d}\n' \
  "$mode" "$id" "$rc" "$secs" "$peak" > "$R/stats.json"
cat "$R/stats.json"
