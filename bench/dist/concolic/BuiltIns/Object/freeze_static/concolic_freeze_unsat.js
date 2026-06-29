// @type concolic
// @target es5 Object.freeze
// @feature builtin freeze

function __test_symbolic__(symbolic) {
  var o = { x: symbolic };
  if (Object.isFrozen(Object.freeze(o))) {
    // @witness Object.freeze(o) freezes o (and returns it), so isFrozen(o) holds and its negation cannot
    __IS_SAT__(!Object.isFrozen(o), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 5));
