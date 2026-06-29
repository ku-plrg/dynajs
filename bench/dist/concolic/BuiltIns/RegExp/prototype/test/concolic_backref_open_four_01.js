// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(([a-z])\2)+(([1-9])\4)+$/.test(symbolic)) {
    if (symbolic.length === 8) {
      // @witness doubled-letter units align on even boundaries, so chars 0,1 share one (([a-z])\2) unit
      __IS_SAT__(symbolic.charAt(0) !== symbolic.charAt(1), false);
    }
  }
}

__test_symbolic__(__symbolic__('s', "aabb1122"));
