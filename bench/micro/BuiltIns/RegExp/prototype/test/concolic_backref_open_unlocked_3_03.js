// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^((.)\2)+$/.test(symbolic)) {
    // @witness __test_symbolic__("aaaaaaaaaaaaaaaaaaaa")
    __IS_SAT__(symbolic === "aaaaaaaaaaaaaaaaaaaa", true);
  }
}

__test_symbolic__(__symbolic__('s', "aaaaaaaaaaaaaaaaaaaa"));
