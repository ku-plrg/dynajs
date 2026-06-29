// @type taint
// @target es6+ logical-assignment
// @feature syntax logical-assignment

function __test_taint__(tainted) {
    var tla_falsy = "";
    tla_falsy ||= tainted;
    // @witness __test_taint__('x') => "" ||= tainted => tla_falsy = 'x' tainted
    __assert_taint__(tla_falsy, true);
}

__test_taint__(__set_taint__("tv"));
