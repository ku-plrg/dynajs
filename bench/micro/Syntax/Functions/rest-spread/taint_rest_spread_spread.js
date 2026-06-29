// @type taint
// @target es6+ rest-spread
// @feature syntax rest-spread
// @done

function tr_take(a, b) {
  return a;
}

function __test_taint__(tainted) {
    var tr_arr = [tainted, "y"];
    // @witness __test_taint__('x') => tr_arr[0] = 'x' tainted, spread as first arg, tr_take returns 'a' = 'x' tainted
    __assert_taint__(tr_take(...tr_arr), true);
}

__test_taint__(__set_taint__("tv"));
