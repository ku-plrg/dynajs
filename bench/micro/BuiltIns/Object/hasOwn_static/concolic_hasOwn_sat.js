// @type concolic
// @target es6+ Object.hasOwn
// @feature builtin hasown

function __test_symbolic__(symbolic) {
  var o = { a: 1 };
  // @witness __test_symbolic__("a")
  __IS_SAT__(Object.hasOwn(o, symbolic), true);
}

__test_symbolic__(__symbolic__('s', "z"));
