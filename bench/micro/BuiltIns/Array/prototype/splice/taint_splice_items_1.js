// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    a.splice(1, 0, tainted, "Y");
    // @witness always a[0] = "a", clean
    __assert_taint__(a[0], false);
}

__test_taint__(__set_taint__("hello"));
