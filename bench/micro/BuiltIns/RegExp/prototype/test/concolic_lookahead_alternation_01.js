// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  if (/^(?=(a|b|c)).$/.test(symbolic)) {
    // @witness the guard pins the whole string to one char in {a,b,c}, so "d" can never pass
    __IS_SAT__(symbolic === "d", false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
