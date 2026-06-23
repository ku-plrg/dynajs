// @type taint
// @target es6+ spread-clone
// @feature syntax spread-clone

function __test_taint__(tainted) {
    var tsc_clean = [{ p: "a" }];
    var tsc_clean_copy = [...tsc_clean];
    __assert_taint__(tsc_clean_copy[0].p, false);
}

__test_taint__(__set_taint__("x"));
