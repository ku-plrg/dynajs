// @type taint
// @target es5 Number.prototype.valueOf
// @feature builtin valueOf

function __test_taint__(tainted) {
    var r = tainted.valueOf();

    // @witness __test_taint__(34) => valueOf returns the tainted number content
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(34));
