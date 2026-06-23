// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-case-insensitive

function __test_symbolic__(symbolic) {
  if (/^ABC$/i.test(symbolic)) {
    // @witness __test_symbolic__("ABC")
    __IS_SAT__(symbolic === "ABC", true);
  }
}

__test_symbolic__(__symbolic__('s', "ABC"));
