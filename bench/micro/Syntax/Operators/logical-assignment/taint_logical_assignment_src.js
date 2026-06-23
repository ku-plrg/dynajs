// @type taint
// @target es6+ logical-assignment
// @feature syntax logical-assignment

function __test_taint__(tainted) {
    var tla_nul = null;
    tla_nul ??= tainted;
    __assert_taint__(tla_nul, true);
}

__test_taint__(__set_taint__("tv"));
