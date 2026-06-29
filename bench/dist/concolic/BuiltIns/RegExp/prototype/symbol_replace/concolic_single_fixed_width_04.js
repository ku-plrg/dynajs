// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-single-fixed-width

function __test_symbolic__(symbolic) {
  symbolic = symbolic.replace(/^...$/, "abdef");

  // @witness __test_symbolic__("abc")
  __IS_SAT__(symbolic === "abdef", true);
}

__test_symbolic__(__symbolic__("s", "ABC"));
