// @type concolic
// @target es6+ exponentiation
// @feature syntax exponentiation

function __test_symbolic__(symbolic) {
    if (symbolic === 3) {
      // @witness the symbolic === 3 guard forces symbolic ** 2 === 9
      __IS_SAT__(symbolic ** 2 !== 9, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 3));
