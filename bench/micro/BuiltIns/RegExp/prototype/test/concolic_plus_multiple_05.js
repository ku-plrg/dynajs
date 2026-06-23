// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a+$/.test(symbolic)) {
  } else {
  }
  if (/^b+$/.test(symbolic)) {
  } else {
  }
  if (/^abc+$/.test(symbolic)) {
    // @witness /^abc+$/ is "ab" then one-or-more "c", which can never equal "abcabc"
    __IS_SAT__(symbolic === "abcabc", false);
  } else {
  }
}

__test_symbolic__(__symbolic__('s', "abc"));
