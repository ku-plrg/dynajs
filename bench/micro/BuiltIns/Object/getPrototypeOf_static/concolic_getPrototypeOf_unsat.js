// @type concolic
// @target es5 Object.getPrototypeOf
// @feature builtin getprototypeof

function __test_symbolic__(symbolic) {
  var proto = { tag: 1 };
  var o = Object.create(proto);
  if (symbolic > 0) {
    // @witness o was created from proto, so getPrototypeOf(o) is exactly proto
    __IS_SAT__(Object.getPrototypeOf(o) !== proto, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 5));
