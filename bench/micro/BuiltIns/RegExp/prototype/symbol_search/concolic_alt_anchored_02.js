// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-alt-anchored

function __test_symbolic__(symbolic) {
  var nl = symbolic.search(/^(a|b)$/);
  if (nl !== -1) {
    // @witness __test_symbolic__("a")
    __IS_SAT__(symbolic === "a", true);
  }
}

__test_symbolic__(__symbolic__("s", "a"));
