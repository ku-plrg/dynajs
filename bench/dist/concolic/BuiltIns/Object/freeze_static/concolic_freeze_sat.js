// @type concolic
// @target es5 Object.freeze
// @feature builtin freeze

function __test_symbolic__(symbolic) {
  var o = { x: 1 };
  if (symbolic > 0) { Object.freeze(o); }
  // @witness __test_symbolic__(1)
  __IS_SAT__(Object.isFrozen(o), true);
}

__test_symbolic__(__symbolic__('s', 0));
