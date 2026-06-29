// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    a.splice(1, 0, tainted, "Y");
    // @witness always a[2] = "Y", clean
    __assert_taint__(a[2], false);
}

__test_taint__(__set_taint__("hello"));
