// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^((.)\2)+$/.test(symbolic)) {
    if (symbolic.length === 8) {
      // @witness __test_symbolic__("aaaabbcc")
      __IS_SAT__(symbolic.charAt(0) === symbolic.charAt(2) && symbolic.charAt(3) !== symbolic.charAt(4), true);
    }
  }
}

__test_symbolic__(__symbolic__('s', "aaaabbcc"));
