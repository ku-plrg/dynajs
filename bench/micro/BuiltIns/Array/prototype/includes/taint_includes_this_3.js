// @type taint
// @target es6+ Array.prototype.includes
// @feature builtin array-includes
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness boolean result, clean
    __assert_taint__(a.includes("z"), false);
}

__test_taint__(__set_taint__("hello"));
