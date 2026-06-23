// @type concolic
// @target es6+ default-parameters
// @feature syntax default-parameters

function dp_g(n, k = 2) {
  return n * k;
}

function __test_symbolic__(symbolic) {
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces dp_g(symbolic, 3) === 15
      __IS_SAT__(dp_g(symbolic, 3) !== 15, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
