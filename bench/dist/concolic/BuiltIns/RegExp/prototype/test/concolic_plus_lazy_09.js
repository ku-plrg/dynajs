// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^z+?$/.test(symbolic)) {
    if (symbolic.length < 5) {
      for (var i = 0; i < symbolic.length; i++) {
        // @witness /^z+?$/ pins every position to "z", so no index can differ from "z"
        __IS_SAT__(symbolic[i] !== "z", false);
      }
    }
  }
}

__test_symbolic__(__symbolic__("s", "z"));
