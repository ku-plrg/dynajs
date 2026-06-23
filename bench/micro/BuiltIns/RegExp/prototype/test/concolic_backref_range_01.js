// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^([ab])\1([ab])\2([ab])\1$/.test(symbolic)) {
    // @witness __test_symbolic__("aabbba")
    __IS_SAT__(symbolic === "aabbba", true);
  }
}

__test_symbolic__(__symbolic__('s', "aabbba"));
