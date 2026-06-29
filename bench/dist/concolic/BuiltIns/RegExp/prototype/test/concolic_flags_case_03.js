// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-case-insensitive

function __test_symbolic__(symbolic) {
  if (/^ABC$/i.test(symbolic)) {
    // @witness /^ABC$/i anchors char 0 to the case-insensitive class of "A", so it is always "a" or "A"
    __IS_SAT__(!(symbolic[0] === "a" || symbolic[0] === "A"), false);
  }
}

__test_symbolic__(__symbolic__('s', "abc"));
