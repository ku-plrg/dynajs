// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness indexOf returns -1 (not found), clean
    __assert_taint__(a.indexOf("z"), false);
}

__test_taint__(__set_taint__("hello"));
