// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(([a-z])\2)+(([1-9])\4)+$/.test(symbolic)) {
    // @witness __test_symbolic__("aaaa11")
    __IS_SAT__(symbolic === "aaaa11", true);
  }
}

__test_symbolic__(__symbolic__('s', "bbbb11"));
