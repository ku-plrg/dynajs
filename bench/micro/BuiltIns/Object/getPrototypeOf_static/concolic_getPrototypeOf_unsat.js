// @type concolic
// @target es5 Object.getPrototypeOf
// @feature builtin getprototypeof

function __test_symbolic__(symbolic) {
  var proto = { tag: 1 };
  var o = symbolic > 0 ? Object.create(proto) : {};
  if (Object.getPrototypeOf(o) === proto) {
    // @witness o's prototype is proto only on the symbolic > 0 branch (where o is created from proto)
    __IS_SAT__(symbolic <= 0, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 5));
