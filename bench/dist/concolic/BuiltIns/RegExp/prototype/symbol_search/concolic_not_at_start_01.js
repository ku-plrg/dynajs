// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-end-anchor

function __test_symbolic__(symbolic) {
  var nl = symbolic.search(/(a|b)$/);
  if (nl !== -1) {
    // @witness a successful search match index is always >= 0, so nl < 0 is impossible
    __IS_SAT__(nl < 0, false);
  }
}

__test_symbolic__(__symbolic__("s", "xxxxa"));
