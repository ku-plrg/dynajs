// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (!(/^he*llo_world*$/.test(symbolic))) {
    // @witness on this branch the input fails /^he*llo_world*$/, so the negated test holds
    __IS_SAT__(!(/^he*llo_world*$/.test(symbolic)), true);
  }
}

__test_symbolic__(__symbolic__("s", ""));
