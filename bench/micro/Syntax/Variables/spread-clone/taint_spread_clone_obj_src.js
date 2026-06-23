// @type taint
// @target es6+ spread-clone
// @feature syntax spread-clone

function __test_taint__(tainted) {
    var tsc_obj = { p: tainted };
    var tsc_obj_copy = { ...tsc_obj };
    __assert_taint__(tsc_obj_copy.p, true);
}

__test_taint__(__set_taint__("tv"));
