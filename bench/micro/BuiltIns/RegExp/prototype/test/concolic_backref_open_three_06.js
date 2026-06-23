// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(([a-z])\2)+(([1-9])\4)+$/.test(symbolic)) {
    // @witness __test_symbolic__("aa11")
    __IS_SAT__(symbolic === "aa11", true);
  }
}

__test_symbolic__(__symbolic__('s', "aa11"));
