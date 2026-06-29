// @type concolic
// @target es6+ generators
// @feature syntax generators

function __test_symbolic__(symbolic) {
    function* gn_h() {
      yield symbolic;
      yield symbolic + symbolic;
    }
    var gn_it = gn_h();
    gn_it.next();
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces gn_it.next().value === 10
      __IS_SAT__(gn_it.next().value !== 10, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
