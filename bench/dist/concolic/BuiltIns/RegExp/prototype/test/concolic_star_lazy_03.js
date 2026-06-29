// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^he*?llo_world*?$/.test(symbolic)) {
    // @witness the empty string fails /^he*?llo_world*?$/ (needs the literal "llo_worl"), so on this guarded path symbolic === "" is unsatisfiable
    __IS_SAT__(symbolic === "", false);
  }
}

__test_symbolic__(__symbolic__("s", "heello_worlddddd"));
