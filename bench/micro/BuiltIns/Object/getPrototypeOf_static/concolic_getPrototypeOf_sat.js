// @type concolic
// @target es5 Object.getPrototypeOf
// @feature builtin getprototypeof

function __test_symbolic__(symbolic) {
  var proto = { tag: 1 };
  var o = symbolic > 0 ? Object.create(proto) : {};
  // @witness __test_symbolic__(1)
  __IS_SAT__(Object.getPrototypeOf(o) === proto, true);
}

__test_symbolic__(__symbolic__('s', 0));
