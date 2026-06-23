// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (!(/^(hello)*(world)*$/.test(symbolic))) {
    // @witness on this branch the input fails /^(hello)*(world)*$/, so the negated test holds
    __IS_SAT__(!(/^(hello)*(world)*$/.test(symbolic)), true);
  }
}

__test_symbolic__(__symbolic__("s", "x"));
