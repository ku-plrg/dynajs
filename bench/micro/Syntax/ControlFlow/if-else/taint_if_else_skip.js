// @type taint
// @target es5 if-else
// @feature syntax if-else

function __test_taint__(tainted) {
    var ti_skip_out = "clean";
    if (false) {
      ti_skip_out = tainted;
    }
    __assert_taint__(ti_skip_out, false);
}

__test_taint__(__set_taint__("tv"));
