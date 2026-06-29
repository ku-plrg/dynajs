// @type concolic
// @target es6+ array-destructuring
// @feature syntax array-destructuring

function __test_symbolic__(symbolic) {
    var [da_x] = [symbolic];
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces da_x === 5
      __IS_SAT__(da_x !== 5, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
