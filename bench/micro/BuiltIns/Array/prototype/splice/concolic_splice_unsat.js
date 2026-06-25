// @type concolic
// @target es5 Array.prototype.splice
// @feature builtin splice
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 3 && symbolic.splice(1, 1)[0] === 9) {
    // @witness splice(1,1) removes one element (the value 9) from a length-3 array, leaving length 2
    __IS_SAT__(symbolic.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 9, 3]));
