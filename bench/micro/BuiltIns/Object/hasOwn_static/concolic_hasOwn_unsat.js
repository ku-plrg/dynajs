// @type concolic
// @target es6+ Object.hasOwn
// @feature builtin hasown

function __test_symbolic__(symbolic) {
  var o = { p: 1 };
  if (symbolic.length >= 1) {
    // @witness o owns "p" on every path, so Object.hasOwn(o, "p") cannot be false
    __IS_SAT__(!Object.hasOwn(o, "p"), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', "abc"));
