// @type concolic
// @target es5 Object.prototype.isPrototypeOf
// @feature builtin isprototypeof

function __test_symbolic__(symbolic) {
  var base = {};
  var derived = Object.create(base);
  var target = symbolic > 0 ? derived : {};
  // @witness __test_symbolic__(1)
  __IS_SAT__(base.isPrototypeOf(target), true);
}

__test_symbolic__(__symbolic__('s', 0));
