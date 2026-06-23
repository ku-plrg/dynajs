// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(([a-z])\2)+(([1-9])\4)+$/.test(symbolic)) {
    // @witness "23" is not a doubled digit, so "aa23" fails the (([1-9])\4)+ tail
    __IS_SAT__(symbolic === "aa23", false);
  }
}

__test_symbolic__(__symbolic__('s', "aa11"));
