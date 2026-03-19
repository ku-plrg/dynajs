# Benchmark

## how to run sunspider benchmark

Make sure `DYNAJS_HOME` points to the repository root:

```shell
export DYNAJS_HOME="$(pwd)"
```

```
./bench/run-sunspider-benchmark.sh
./bench/run-sunspider-benchmark.sh --analysis TraceAll --mode full --bench controlflow-recursive
./bench/run-sunspider-benchmark.sh --analysis EmptyAnalysis --mode partial --bench string-tagcloud --output-dir /tmp/dynajs-bench-test-2
./bench/run-sunspider-benchmark.sh --analysis TraceAll --mode full --bench controlflow-recursive --output-dir /tmp/dynajs-bench-test-trace-2
```
