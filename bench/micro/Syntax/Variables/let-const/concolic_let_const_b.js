// @type concolic
// @target es6+ let-const
// @feature syntax let-const

function __test_symbolic__(symbolic) {
    let lc_out;
    {
      let lc_inner = symbolic * 2;
      lc_out = lc_inner;
    }
    if (symbolic === 4) {
      // @witness the symbolic === 4 guard forces lc_out === 8
      __IS_SAT__(lc_out !== 8, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 4));
