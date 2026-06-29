// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(([a-z])\2)+$/.test(symbolic)) {
    // @witness regex units are doubled lowercase letters, so all-digit "11" cannot match
    __IS_SAT__(symbolic === "11", false);
  }
}

__test_symbolic__(__symbolic__('s', "aa"));
