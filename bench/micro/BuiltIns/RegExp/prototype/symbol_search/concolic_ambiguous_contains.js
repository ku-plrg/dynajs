// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-unanchored

function __test_symbolic__(symbolic) {
  var nl = symbolic.search(/abc/);
  if (nl > -1) {
    // @witness __test_symbolic__("Xabc")
    __IS_SAT__(nl > 0, true);
  }
}

__test_symbolic__(__symbolic__('s', "Xabc"));
