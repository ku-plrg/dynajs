// @type concolic
// @target es6+ let-const
// @feature syntax let-const

function __test_symbolic__(symbolic) {
    const lc_c = symbolic;
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces lc_c + 1 === 6
      __IS_SAT__(lc_c + 1 !== 6, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
