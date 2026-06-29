// @type taint
// @target es6+ Array.prototype.at
// @feature builtin array-at
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness negative index reaches tainted "x"
    __assert_taint__(a.at(-3), true);
}

__test_taint__(__set_taint__("hello"));
