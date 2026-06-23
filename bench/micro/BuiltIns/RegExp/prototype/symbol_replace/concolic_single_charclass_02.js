// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-single-charclass

function __test_symbolic__(symbolic) {
  if (symbolic.replace(/(a|b)/, "Test") === "Test") {
    // @witness __test_symbolic__("a")
    __IS_SAT__(symbolic.indexOf("b") === -1, true);
  }
}

__test_symbolic__(__symbolic__("s", "a"));
