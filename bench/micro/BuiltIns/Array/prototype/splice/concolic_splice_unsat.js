// @type concolic
// @target es5 Array.prototype.splice
// @feature builtin splice

function __test_symbolic__(symbolic) {
  if (symbolic.length === 3) {
    symbolic.splice(1, 1);
    // @witness removing exactly one element drops the length from 3 to 2
    __IS_SAT__(symbolic.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2, 3]));
