// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  // @witness the lookahead (?=b) and the literal c pin the same position to both b and c, a contradiction, so the regex matches no string
  __IS_SAT__(/^a(?=b)c$/.test(symbolic), false);
}

__test_symbolic__(__symbolic__('s', ""));
