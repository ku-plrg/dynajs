// @type concolic
// @target es5 String.prototype.split
// @feature builtin regexp-split-capture-length

function __test_symbolic__(symbolic) {
  if (symbolic.length < 5) {
    symbolic = symbolic.split(/(a)/);
    // @witness split with one capture group /(a)/ yields 2m+1 elements (text pieces interleaved with m captures), always odd, so length can never equal 6
    __IS_SAT__(symbolic.length === 6, false);
  }
}

__test_symbolic__(__symbolic__("s", ""));
