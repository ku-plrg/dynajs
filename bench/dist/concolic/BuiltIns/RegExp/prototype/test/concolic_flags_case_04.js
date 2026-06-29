// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-case-insensitive

function __test_symbolic__(symbolic) {
  if (/^ABC$/i.test(symbolic)) {
    // @witness /^ABC$/i anchors char 1 to the case-insensitive class of "B", so it is always "b" or "B"
    __IS_SAT__(!(symbolic[1] === "b" || symbolic[1] === "B"), false);
  }
}

__test_symbolic__(__symbolic__('s', "abc"));
