// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^zed??$/.test(symbolic)) {
    // @witness __test_symbolic__("ze")
    __IS_SAT__(symbolic === "ze", true);
  }
}

__test_symbolic__(__symbolic__('s', "zed"));
