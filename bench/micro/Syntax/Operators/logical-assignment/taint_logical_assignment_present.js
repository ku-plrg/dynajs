// @type taint
// @target es6+ logical-assignment
// @feature syntax logical-assignment

function __test_taint__(tainted) {
    var tla_present = "present";
    tla_present ??= "tainted-unused";
    __assert_taint__(tla_present, false);
}

__test_taint__(__set_taint__("x"));
