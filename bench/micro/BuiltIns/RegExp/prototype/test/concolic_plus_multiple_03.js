// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a+$/.test(symbolic)) {
  } else {
  }
  if (/^b+$/.test(symbolic)) {
    // @witness /^b+$/ anchors the string to one-or-more "b", so the first char is always "b"
    __IS_SAT__(symbolic.charAt(0) !== "b", false);
  } else {
  }
  if (/^abc+$/.test(symbolic)) {
  } else {
  }
}

__test_symbolic__(__symbolic__('s', "b"));
