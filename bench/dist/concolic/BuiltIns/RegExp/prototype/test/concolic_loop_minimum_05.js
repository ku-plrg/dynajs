// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (symbolic.length < 20) {
    if (/^(abc){3,}$/.test(symbolic)) {
      // @witness a guard-passer is a concatenation of "abc" blocks, so its first 3-char block is always "abc"
      __IS_SAT__(symbolic.substr(0, 3) !== "abc", false);
    }
  }
}

__test_symbolic__(__symbolic__("s", "abcabcabc"));
