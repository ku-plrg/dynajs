// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a+$/.test(symbolic)) {
  } else {
    // @witness "a" matches /^a+$/ and takes the then-branch, so it is unreachable in the else branch
    __IS_SAT__(symbolic === "a", false);
  }
  if (/^b+$/.test(symbolic)) {
  } else {
  }
  if (/^abc+$/.test(symbolic)) {
  } else {
  }
}

__test_symbolic__(__symbolic__('s', ""));
