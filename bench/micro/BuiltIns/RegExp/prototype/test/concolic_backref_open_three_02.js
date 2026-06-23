// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(([a-z])\2)+(([1-9])\4)+$/.test(symbolic)) {
    // @witness (([a-z])\2)+ forces equal letters per unit, so the distinct pair "ab" cannot match
    __IS_SAT__(symbolic === "ab", false);
  }
}

__test_symbolic__(__symbolic__('s', "aa11"));
