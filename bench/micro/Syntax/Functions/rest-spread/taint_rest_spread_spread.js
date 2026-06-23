// @type taint
// @target es6+ rest-spread
// @feature syntax rest-spread

function tr_take(a, b) {
  return a;
}

function __test_taint__(tainted) {
    var tr_arr = [tainted, "y"];
    __assert_taint__(tr_take(...tr_arr), true);
}

__test_taint__(__set_taint__("tv"));
