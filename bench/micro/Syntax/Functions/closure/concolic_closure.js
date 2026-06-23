// @type concolic
// @target es5 closure
// @feature syntax closure

function cl_make(x) {
  return function () {
    return x + 1;
  };
}

function __test_symbolic__(symbolic) {
    var cl_fn = cl_make(symbolic);
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces cl_fn() === 6
      __IS_SAT__(cl_fn() !== 6, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
