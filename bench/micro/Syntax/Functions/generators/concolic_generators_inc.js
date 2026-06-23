// @type concolic
// @target es6+ generators
// @feature syntax generators

function __test_symbolic__(symbolic) {
    function* gn_g() {
      yield symbolic + 1;
    }
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces gn_g().next().value === 6
      __IS_SAT__(gn_g().next().value !== 6, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
