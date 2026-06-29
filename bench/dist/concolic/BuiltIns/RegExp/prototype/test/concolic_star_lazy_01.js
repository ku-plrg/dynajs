// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^he*?llo_world*?$/.test(symbolic)) {
    // @witness __test_symbolic__("heello_worlddddd")
    __IS_SAT__(symbolic === "heello_worlddddd", true);
  }
}

__test_symbolic__(__symbolic__("s", "heello_worldddddd"));
