// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (symbolic.length < 10) {
    if (/^(.)\1+$/.test(symbolic)) {
      if (symbolic.length > 3) {
        // @witness same backreference pins charAt(2) to charAt(0), so they can never differ
        __IS_SAT__(symbolic.charAt(2) !== symbolic.charAt(0), false);
      }
    }
  }
}

__test_symbolic__(__symbolic__('s', "aaaa"));
