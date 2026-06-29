// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (symbolic.length < 20) {
    if (/^(abc){3,}$/.test(symbolic)) {
      // @witness the empty string cannot satisfy the anchored {3,} quantifier
      __IS_SAT__(symbolic === "", false);
    }
  }
}

__test_symbolic__(__symbolic__("s", "abcabcabc"));
