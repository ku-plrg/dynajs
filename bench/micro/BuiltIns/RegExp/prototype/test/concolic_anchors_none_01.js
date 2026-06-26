// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-anchors-none

function __test_symbolic__(symbolic) {
  if (/--.+=/.test(symbolic)) {
    // @witness __test_symbolic__("x--a=")
    __IS_SAT__(symbolic.charAt(0) !== "-", true);
  }
}

__test_symbolic__(__symbolic__("s", "X--A="));
