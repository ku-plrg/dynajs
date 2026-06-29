// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  if (/^.(?=(a|b|c)).$/.test(symbolic)) {
    // @witness the lookahead pins charAt(1) to one of {a,b,c}, never "d"
    __IS_SAT__(symbolic.charAt(1) === "d", false);
  }
}

__test_symbolic__(__symbolic__('s', "Xa"));
