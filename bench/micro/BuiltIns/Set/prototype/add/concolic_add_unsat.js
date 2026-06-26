// @type concolic
// @target es6+ Set.prototype.add
// @feature builtin add
// @done

function __test_symbolic__(symbolic) {
  var s = new Set([1, 2]);
  if (s.add(symbolic).has(symbolic)) {
    // @witness add(symbolic) inserts it, so has(symbolic) holds afterward and its negation cannot
    __IS_SAT__(!s.has(symbolic), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
