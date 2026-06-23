// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-single-fixed-width

function __test_symbolic__(symbolic) {
  symbolic = symbolic.replace(/^...$/, "abdef");
  // @witness __test_symbolic__("hello")
  __IS_SAT__(symbolic === "hello", true);
}

__test_symbolic__(__symbolic__("s", "hello"));
