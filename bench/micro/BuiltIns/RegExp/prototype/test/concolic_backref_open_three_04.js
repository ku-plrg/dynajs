// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(([a-z])\2)+(([1-9])\4)+$/.test(symbolic)) {
    // @witness same as "aa": no trailing doubled-digit unit, so "zz" cannot match
    __IS_SAT__(symbolic === "zz", false);
  }
}

__test_symbolic__(__symbolic__('s', "aa11"));
