// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^((.)\2)+$/.test(symbolic)) {
    // @witness __test_symbolic__("bb")
    __IS_SAT__(symbolic === "bb", true);
  }
}

__test_symbolic__(__symbolic__('s', "bb"));
