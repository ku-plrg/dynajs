// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-global-removes-all

function __test_symbolic__(symbolic) {
  if (symbolic.replace(/(a|b)/g, "Test") === "Test") {
    // @witness __test_symbolic__("a")
    __IS_SAT__(!(symbolic.indexOf("a") === -1 && symbolic.indexOf("b") === -1), true);
  }
}

__test_symbolic__(__symbolic__('s', "b"));
