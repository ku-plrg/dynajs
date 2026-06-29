// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(hello)*(world)*$/.test(symbolic)) {
    // @witness this branch already pins /^(hello)*(world)*$/.test to true, so its negation cannot hold here
    __IS_SAT__(!(/^(hello)*(world)*$/.test(symbolic)), false);
  }
}

__test_symbolic__(__symbolic__("s", "helloworld"));
