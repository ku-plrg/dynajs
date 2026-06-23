// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^((.)\2)+$/.test(symbolic)) {
    // @witness __test_symbolic__("HHeelloo")
    __IS_SAT__(symbolic === "HHeelloo", true);
  }
}

__test_symbolic__(__symbolic__('s', "HHeelloo"));
