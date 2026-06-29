// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (symbolic.length < 10) {
    if (/^z*$/.test(symbolic)) {
      for (var i = 0; i < symbolic.length; i++) {
        // @witness /^z*$/ forces every in-bounds character to be "z", so symbolic[i] !== "z" is unsatisfiable
        __IS_SAT__(symbolic[i] !== "z", false);
      }
    }
  }
}

__test_symbolic__(__symbolic__("s", "z"));
