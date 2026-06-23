// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-charat

function __test_symbolic__(symbolic) {
  if (symbolic.length < 5) {
    var nl = symbolic.search(/(a*)(ab)?/);
    // @witness __test_symbolic__("aaab")
    __IS_SAT__(symbolic.charAt(3) === "b", true);
  }
}

__test_symbolic__(__symbolic__("s", ""));
