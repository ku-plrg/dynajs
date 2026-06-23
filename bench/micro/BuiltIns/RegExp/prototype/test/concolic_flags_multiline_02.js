// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-multiline

function __test_symbolic__(symbolic) {
  if (/^abc$/m.test(symbolic)) {
    // @witness __test_symbolic__("hello\nabc")
    __IS_SAT__(symbolic === "hello\nabc", true);
  }
}

__test_symbolic__(__symbolic__('s', "hello\nabc"));
