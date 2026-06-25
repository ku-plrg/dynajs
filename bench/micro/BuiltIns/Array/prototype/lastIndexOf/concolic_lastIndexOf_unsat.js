// @type concolic
// @target es5 Array.prototype.lastIndexOf
// @feature builtin lastindexof
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.lastIndexOf(5) === 1) {
    // @witness lastIndexOf(5) === 1 means index 1 holds the value 5
    __IS_SAT__(symbolic[1] !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 5]));
