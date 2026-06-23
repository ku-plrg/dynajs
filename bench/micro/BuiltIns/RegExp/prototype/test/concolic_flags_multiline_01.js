// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-multiline

function __test_symbolic__(symbolic) {
  if (/^abc$/m.test(symbolic)) {
    // @witness "helloabc" has no line equal to exactly "abc", so it can never pass the /^abc$/m guard
    __IS_SAT__(symbolic === "helloabc", false);
  }
}

__test_symbolic__(__symbolic__('s', "abc"));
