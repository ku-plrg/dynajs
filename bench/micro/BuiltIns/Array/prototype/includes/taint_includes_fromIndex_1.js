// @type taint
// @target es6+ Array.prototype.includes
// @feature builtin array-includes
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    // @witness boolean result, clean; tainted is only the fromIndex
    __assert_taint__(a.includes("a", tainted), false);
}

__test_taint__(__set_taint__(0));
