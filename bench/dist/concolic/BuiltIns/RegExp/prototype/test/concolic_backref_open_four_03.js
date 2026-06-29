// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(([a-z])\2)+(([1-9])\4)+$/.test(symbolic)) {
    if (symbolic.length === 8) {
      // @witness chars 4,5 fall inside a single doubled unit, forcing them equal
      __IS_SAT__(symbolic.charAt(4) !== symbolic.charAt(5), false);
    }
  }
}

__test_symbolic__(__symbolic__('s', "aabb1122"));
