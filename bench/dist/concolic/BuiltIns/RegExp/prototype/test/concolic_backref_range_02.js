// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^([ab])\1([ab])\2([ab])\1$/.test(symbolic)) {
    // @witness first \1 forces char 1 to equal char 0, but "abaaaa" has differing first two chars, so no match equals it
    __IS_SAT__(symbolic === "abaaaa", false);
  }
}

__test_symbolic__(__symbolic__('s', "aabbba"));
