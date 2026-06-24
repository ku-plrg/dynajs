// @type concolic
// @target es5 Array.prototype.slice
// @feature builtin slice

function __test_symbolic__(symbolic) {
  if (symbolic.length >= 1) {
    var copy = symbolic.slice();
    // @witness slice() with no args copies every element, so the result length equals the source length
    __IS_SAT__(copy.length !== symbolic.length, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [7]));
