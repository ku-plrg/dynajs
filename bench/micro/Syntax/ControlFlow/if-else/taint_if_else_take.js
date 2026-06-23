// @type taint
// @target es5 if-else
// @feature syntax if-else

function __test_taint__(tainted) {
    var ti_take_out;
    if (true) {
      ti_take_out = tainted;
    } else {
      ti_take_out = "x";
    }
    __assert_taint__(ti_take_out, true);
}

__test_taint__(__set_taint__("tv"));
