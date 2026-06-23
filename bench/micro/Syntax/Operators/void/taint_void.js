// @type taint
// @target es5 void
// @feature syntax void

function __test_taint__(tainted) {
    __assert_taint__(void tainted, false);
}

__test_taint__(__set_taint__("tv"));
