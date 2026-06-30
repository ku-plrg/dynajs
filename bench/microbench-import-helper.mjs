function noop() {}

// taint prelude: under plain node, sources/sinks are inert so the bench runs as
// ordinary JS (the assert's `expected` arg is ignored; no verdict is emitted).
// __set_taint__ returns its argument so `__test_taint__(__set_taint__(seed))`
// threads the real seed value through under plain node.
globalThis.__set_taint__ = (v) => v;
globalThis.__assert_taint__ = noop;

// concolic prelude: under plain node a symbolic var is just its concrete seed,
// and an assert / SAT-query is a no-op (the symbolic check only happens under
// dynajs). `__IS_SAT__(query, expectedSat)` is the current sat/unsat oracle form.
globalThis.__symbolic__ = (_name, seed) => seed;
globalThis.__symbolic_assert__ = noop;
globalThis.__IS_SAT__ = noop;
