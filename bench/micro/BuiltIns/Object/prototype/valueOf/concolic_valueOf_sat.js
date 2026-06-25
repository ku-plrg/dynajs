// @type concolic
// @target es5 Object.prototype.valueOf
// @feature builtin valueof

function __test_symbolic__(symbolic) {
  var o = {};
  var target = symbolic > 0 ? o : {};
  // @witness __test_symbolic__(1)
  __IS_SAT__(o.valueOf() === target, true);
}

__test_symbolic__(__symbolic__('s', -1));
