// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^he*llo_world*$/.test(symbolic)) {
    // @witness /^he*llo_world*$/ requires the literal "h...llo_worl..." so the empty string can never match this branch
    __IS_SAT__(symbolic === "", false);
  }
}

__test_symbolic__(__symbolic__("s", "heello_worlddddd"));
