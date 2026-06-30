// @type concolic
// @target es5 Array.prototype.concat
// @feature builtin concat
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.concat(99).length === 3) {
    // @witness concat(99) appends one element, so a result of length 3 forces the source length to 2
    __IS_SAT__(symbolic.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
