// @type concolic
// @target es5 String.prototype.split
// @feature builtin regexp-split-capture-keeps-separator

function __test_symbolic__(symbolic) {
  if (symbolic.length < 5) {
    symbolic = symbolic.split(/(a)/);
    // @witness __test_symbolic__("a")
    __IS_SAT__(symbolic.indexOf("a") !== -1, true);
  }
}

__test_symbolic__(__symbolic__("s", ""));
