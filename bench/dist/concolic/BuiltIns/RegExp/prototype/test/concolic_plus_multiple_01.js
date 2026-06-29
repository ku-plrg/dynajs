// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a+$/.test(symbolic)) {
    // @witness /^a+$/ anchors the string to one-or-more "a", so the first char is always "a"
    __IS_SAT__(symbolic.charAt(0) !== "a", false);
  } else {
  }
  if (/^b+$/.test(symbolic)) {
  } else {
  }
  if (/^abc+$/.test(symbolic)) {
  } else {
  }
}

__test_symbolic__(__symbolic__('s', "a"));
