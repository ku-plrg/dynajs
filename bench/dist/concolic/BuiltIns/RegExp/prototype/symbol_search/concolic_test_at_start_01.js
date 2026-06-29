// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-end-positions

function __test_symbolic__(symbolic) {
  var nl = symbolic.search(/(a|b)$/);
  if (nl !== -1) {
    // @witness search never returns a negative index once the guard excludes -1
    __IS_SAT__(nl < 0, false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
