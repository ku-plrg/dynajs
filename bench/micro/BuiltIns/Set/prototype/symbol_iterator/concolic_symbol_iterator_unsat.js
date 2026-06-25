// @type concolic
// @target es6+ Set.prototype[Symbol.iterator]
// @feature builtin symbol_iterator

function __test_symbolic__(symbolic) {
  var s = new Set([symbolic]);
  if (s.has(symbolic)) {
    // @witness the default iterator yields the stored elements, so the first equals symbolic
    __IS_SAT__(s[Symbol.iterator]().next().value !== symbolic, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
