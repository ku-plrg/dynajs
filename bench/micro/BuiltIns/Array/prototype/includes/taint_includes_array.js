// @type taint
// @target es6+ Array.prototype.includes
// @feature builtin array-includes
// @done

function __test_taint__(tainted) {
    var r = tainted.includes("a");
    // @witness always a.includes("x") returns boolean => clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
