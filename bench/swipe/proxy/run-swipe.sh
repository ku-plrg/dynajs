#!/bin/bash
# usage (inside container): run-swipe.sh <jalangi|dynajs|dynajs-b> <config.json> <targets-file>
#   dynajs   = PSE ported to DynaJS (option A); dynajs-b = DynaJS concolic analysis (option B)
# Expects: --add-host swipe.test:127.0.0.1, ~/swipe mounted at /host (ro),
#          and for dynajs bench/swipe mounted at /dynajs (ro).
# SWIPE tests/ are served at http://swipe.test:8000/ (node: run.sh does `killall python3`).
mode="$1"
W=/home/scan/jalangi2-workspace
Xvfb :99 -screen 0 1280x1024x24 </dev/null >/dev/null 2>&1 &
export DISPLAY=:99
node /host/static-server.js $W/tests 8000 >/tmp/httpserver.log 2>&1 &
if [ "$mode" = dynajs ] || [ "$mode" = dynajs-b ]; then
  # Partial mode: only the hooks of the callbacks each analysis implements
  # (read off D$.analysis in the browser), plus eval instrumentation
  # (instrumentCodePre/instrumentCode), which Jalangi always does.
  # DYNAJS_HOOKS=full (docker -e) instruments every hook instead.
  if [ "$mode" = dynajs ]; then
    hooks=invokeFunPre,invokeFun,getFieldPre,getField,putFieldPre,putField,unaryPre,unary,binaryPre,binary,condition,instrumentCodePre,instrumentCode
  else
    hooks=invokeFunPre,invokeFun,templateConcatPre,templateConcat,forInOfObject,getFieldPre,getField,putFieldPre,unaryPre,unary,binaryPre,binary,condition,classHeritage,literal,instrumentCodePre,instrumentCode
  fi
  hookopt="--hooks $hooks"
  [ "${DYNAJS_HOOKS:-}" = full ] && hookopt=
  /opt/node20/bin/node /dynajs/proxy/instrument-server.mjs --log /tmp/dynajs-instrument.jsonl $hookopt >/tmp/dynajs-server.log 2>&1 &
  cp /dynajs/proxy/proxy.py $W/packages/jalangi2/scripts/proxy.py
  analysis=/dynajs/dist/pse-dynajs.js
  [ "$mode" = dynajs-b ] && analysis=/dynajs/dist/dse-dynajs.js
  # DYNAJS_ANALYSIS=<file in dist/> overrides the bundle (e.g. dse-dynajs-trace.js,
  # which reports progress to tracelog.mjs on 8398)
  [ -n "${DYNAJS_ANALYSIS:-}" ] && analysis=/dynajs/dist/$DYNAJS_ANALYSIS
  /opt/node20/bin/node /dynajs/proxy/tracelog.mjs 8398 /tmp/dynajs-trace.jsonl >/dev/null 2>&1 &
  hdr=/dynajs/dist/dynajs-runtime.js,$analysis
  # only the instrumenting proxy (8305); run-mitmproxy_noinstr is left alone
  sed -i "s#--set useBabel=true#--set useBabel=false --set instrumenter=dynajs --set dynajsHeader=$hdr#" $W/scripts/run-mitmproxy
  grep -q 'instrumenter=dynajs' $W/scripts/run-mitmproxy || { echo "patching run-mitmproxy failed"; exit 1; }
fi
sleep 2
cd $W/scripts/swipe
cp "$2" config/config.json
cp "$3" config/sample_targets
./run.sh
