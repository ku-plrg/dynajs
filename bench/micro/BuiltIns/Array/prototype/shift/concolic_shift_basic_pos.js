// @type concolic
// @target es5 Array.prototype.shift
// @feature builtin shift

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    symbolic.shift();
    // @witness shift removes one element, dropping the length from 2 to 1
    __IS_SAT__(symbolic.length !== 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
