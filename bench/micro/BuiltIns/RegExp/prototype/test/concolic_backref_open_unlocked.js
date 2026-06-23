// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^((.)\2)+$/.test(symbolic)) {
    if (symbolic.length === 4) {
      // @witness __test_symbolic__("aabb")
      __IS_SAT__(symbolic.charAt(0) !== symbolic.charAt(2), true);
    }
  }
}

__test_symbolic__(__symbolic__('s', "aabb"));
