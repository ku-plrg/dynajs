// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-end-positions

function __test_symbolic__(symbolic) {
  var nl = symbolic.search(/(a|b)$/);
  if (nl !== -1) {
    // @witness (a|b)$ matches a single "a" or "b", so the char at the match index is always one of them
    __IS_SAT__(!(symbolic[nl] === "a" || symbolic[nl] === "b"), false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
