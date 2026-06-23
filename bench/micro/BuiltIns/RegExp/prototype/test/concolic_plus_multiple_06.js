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
  } else {
    // @witness "abc" matches /^abc+$/ and takes the then-branch, so it is unreachable in the else branch
    __IS_SAT__(symbolic === "abc", false);
  }
}

__test_symbolic__(__symbolic__('s', ""));
