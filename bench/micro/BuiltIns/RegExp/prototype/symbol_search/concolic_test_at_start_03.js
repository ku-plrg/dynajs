// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-end-positions

function __test_symbolic__(symbolic) {
  var nl = symbolic.search(/(a|b)$/);
  if (nl !== -1) {
    // @witness __test_symbolic__("xxxxxa")
    __IS_SAT__(nl === 5, true);
  }
}

__test_symbolic__(__symbolic__('s', "xxxxxa"));
