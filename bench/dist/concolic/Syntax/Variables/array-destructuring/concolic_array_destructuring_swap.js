// @type concolic
// @target es6+ array-destructuring
// @feature syntax array-destructuring

function __test_symbolic__(symbolic) {
    var [da_p, da_q] = [2, symbolic];
    if (symbolic === 1) {
      // @witness the symbolic === 1 guard forces da_q === 1
      __IS_SAT__(da_q !== 1, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 1));
