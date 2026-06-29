// @type concolic
// @target es6+ arrow-function
// @feature syntax arrow-function

function __test_symbolic__(symbolic) {
    var dbl = (n) => n + n;
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces dbl(symbolic) === 10
      __IS_SAT__(dbl(symbolic) !== 10, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
