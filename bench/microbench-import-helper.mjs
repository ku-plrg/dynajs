function noop() {}

// taint prelude: under plain node, sources/sinks are inert so the bench runs as
// ordinary JS (the assert's `expected` arg is ignored; no verdict is emitted).
globalThis.__set_taint__ = noop;
globalThis.__assert_taint__ = noop;

// concolic prelude: under plain node a symbolic var is just its concrete seed,
// and an assert is a no-op (the symbolic check only happens under dynajs).
globalThis.__symbolic__ = (_name, seed) => seed;
globalThis.__symbolic_assert__ = noop;
