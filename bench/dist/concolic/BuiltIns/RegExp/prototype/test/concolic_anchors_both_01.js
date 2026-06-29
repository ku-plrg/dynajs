// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-anchors-both

function __test_symbolic__(symbolic) {
  if (symbolic.length < 10) {
    if (/^--.+=$/.test(symbolic)) {
      // @witness the leading ^-- anchor pins charAt(0) to "-", so it can never differ from "-"
      __IS_SAT__(symbolic[0] !== "-", false);
    }
  }
}

__test_symbolic__(__symbolic__("s", "--x="));
