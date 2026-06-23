// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^he*llo_world*$/.test(symbolic)) {
    // @witness this branch already pins /^he*llo_world*$/.test to true, so its negation cannot hold here
    __IS_SAT__(!(/^he*llo_world*$/.test(symbolic)), false);
  }
}

__test_symbolic__(__symbolic__("s", "hello_world"));
