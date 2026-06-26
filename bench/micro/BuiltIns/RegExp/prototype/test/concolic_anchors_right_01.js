// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-anchors-right

function __test_symbolic__(symbolic) {
  if (symbolic.length < 10) {
    if (/--.+=$/.test(symbolic)) {
      // @witness __test_symbolic__("x--a=")
      __IS_SAT__(symbolic[0] !== "-", true);
    }
  }
}

__test_symbolic__(__symbolic__("s", "X--A="));
