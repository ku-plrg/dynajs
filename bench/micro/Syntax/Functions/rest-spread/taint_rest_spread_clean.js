// @type taint
// @target es6+ rest-spread
// @feature syntax rest-spread

function __test_taint__(tainted) {
    var tr_clean = ["a", "b"];
    function tr_pick(a, b) {
      return b;
    }
    __assert_taint__(tr_pick(...tr_clean), false);
}

__test_taint__(__set_taint__("x"));
