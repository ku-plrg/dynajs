// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(([a-z])\2)+$/.test(symbolic)) {
    // @witness __test_symbolic__("aa")
    __IS_SAT__(symbolic === "aa", true);
  }
}

__test_symbolic__(__symbolic__('s', "aa"));
