function noop() {}

globalThis.__set_taint__ = noop;
globalThis.__print_if_tainted__ = noop;

// concolic prelude: under plain node a symbolic var is just its concrete seed,
// and an assert is a no-op (the symbolic check only happens under dynajs).
globalThis.__symbolic__ = (_name, seed) => seed;
globalThis.__symbolic_assert__ = noop;