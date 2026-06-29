// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^[a-zA-Z]?$/.test(symbolic)) {
    // @witness __test_symbolic__("A")
    __IS_SAT__(!(/^[a-z]$/.test(symbolic)), true);
  }
  if (/^[a-z]$/.test(symbolic)) {
    // @witness guard /^[a-z]$/ already forces a single lowercase letter, so its negation is unsatisfiable here
    __IS_SAT__(!(/^[a-z]$/.test(symbolic)), false);
  }
}

__test_symbolic__(__symbolic__('s', ""));
