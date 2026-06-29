// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  if (/^(?=(a|b|c)).$/.test(symbolic)) {
    // @witness the lookahead+single-char anchor admits only a|b|c, so a guard-passer outside that set cannot exist
    __IS_SAT__(!(symbolic === "a" || symbolic === "b" || symbolic === "c"), false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
