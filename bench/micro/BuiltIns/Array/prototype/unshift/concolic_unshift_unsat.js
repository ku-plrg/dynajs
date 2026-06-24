// @type concolic
// @target es5 Array.prototype.unshift
// @feature builtin unshift

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var n = symbolic.unshift(0);
    // @witness unshift prepends one element and returns the new length 3
    __IS_SAT__(n !== 3, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
