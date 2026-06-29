// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^([ab])\1([ab])\2([ab])\1$/.test(symbolic)) {
    // @witness group ([ab])\1 pins char 1 to the captured char 0, so the two chars can never differ
    __IS_SAT__(symbolic[0] !== symbolic[1], false);
  }
}

__test_symbolic__(__symbolic__('s', "aabbba"));
