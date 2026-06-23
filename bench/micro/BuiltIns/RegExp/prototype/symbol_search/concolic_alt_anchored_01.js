// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-alt-anchored

function __test_symbolic__(symbolic) {
  var nl = symbolic.search(/^(a|b)$/);
  if (nl !== -1) {
    // @witness anchored ^(a|b)$ matches at start, so search returns 0, never 3
    __IS_SAT__(nl === 3, false);
  }
}

__test_symbolic__(__symbolic__("s", "a"));
