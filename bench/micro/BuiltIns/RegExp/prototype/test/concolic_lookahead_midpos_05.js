// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  if (/^.(?=(a|b|c)).$/.test(symbolic)) {
    // @witness the guard forces charAt(1) into {a,b,c}, so the disjunction always holds
    __IS_SAT__(!(symbolic.charAt(1) === "a" || symbolic.charAt(1) === "b" || symbolic.charAt(1) === "c"), false);
  }
}

__test_symbolic__(__symbolic__('s', "Xa"));
