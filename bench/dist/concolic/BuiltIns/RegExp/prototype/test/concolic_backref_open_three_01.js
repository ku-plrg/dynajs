// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(([a-z])\2)+(([1-9])\4)+$/.test(symbolic)) {
    // @witness regex needs a doubled-letter unit before any digits, so the all-digit "11" cannot match
    __IS_SAT__(symbolic === "11", false);
  }
}

__test_symbolic__(__symbolic__('s', "aa11"));
