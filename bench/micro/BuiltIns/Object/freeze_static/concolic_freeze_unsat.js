// @type concolic
// @target es5 Object.freeze
// @feature builtin freeze

function __test_symbolic__(symbolic) {
  var o = { x: symbolic };
  Object.freeze(o);
  if (symbolic > 0) {
    // @witness Object.freeze makes the object frozen, so isFrozen can never be false afterward
    __IS_SAT__(!Object.isFrozen(o), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 5));
