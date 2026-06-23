// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a{0,3}$/.test(symbolic)) {
    // @witness __test_symbolic__("")
    __IS_SAT__(symbolic === "", true);
  }
}

__test_symbolic__(__symbolic__("s", ""));
