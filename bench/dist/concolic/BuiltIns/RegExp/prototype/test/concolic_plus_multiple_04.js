// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a+$/.test(symbolic)) {
  } else {
  }
  if (/^b+$/.test(symbolic)) {
  } else {
    // @witness "b" matches /^b+$/ and takes the then-branch, so it is unreachable in the else branch
    __IS_SAT__(symbolic === "b", false);
  }
  if (/^abc+$/.test(symbolic)) {
  } else {
  }
}

__test_symbolic__(__symbolic__('s', ""));
