// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-case-insensitive

function __test_symbolic__(symbolic) {
  if (/^ABC$/i.test(symbolic)) {
    // @witness /^ABC$/i anchors char 2 to the case-insensitive class of "C", so it is always "c" or "C"
    __IS_SAT__(!(symbolic[2] === "c" || symbolic[2] === "C"), false);
  }
}

__test_symbolic__(__symbolic__('s', "abc"));
