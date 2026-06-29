// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-single-fixed-width

function __test_symbolic__(symbolic) {
  symbolic = symbolic.replace(/^...$/, "abdef");

  // @witness /^...$/ matches any 3-char input which is then replaced by "abdef", so the length-3 string "abc" can never survive as output
  __IS_SAT__(symbolic === "abc", false);
}

__test_symbolic__(__symbolic__("s", "abdef"));
