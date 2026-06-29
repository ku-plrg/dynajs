// @type taint
// @target es6+ Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var a = [tainted, "b"];
    var len = a.unshift("c");
    // @witness always a[0] = "c", clean
    __assert_taint__(a[0], false);
}

__test_taint__(__set_taint__("hello"));
