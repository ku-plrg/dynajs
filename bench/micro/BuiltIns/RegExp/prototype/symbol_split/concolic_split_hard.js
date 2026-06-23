// @type concolic
// @target es5 String.prototype.split
// @feature builtin regexp-split-capture-odd-length

function __test_symbolic__(symbolic) {
  symbolic = symbolic.split(/(a)/);
  if (symbolic.length < 100) {
    // @witness split on a single capture group /(a)/ interleaves each captured "a", so length is always 2*matches+1 (odd) and can never equal 16
    __IS_SAT__(symbolic.length === 16, false);
  }
}

__test_symbolic__(__symbolic__("s", ""));
