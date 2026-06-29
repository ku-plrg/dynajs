// @type taint
// @target es6+ Array.prototype.push
// @feature builtin array-push
// 

function __test_taint__(tainted) {
    var a = [tainted, "b"];
    var len = a.push("c");
    // @witness always a[1] = "b", clean
    __assert_taint__(a[1], false);
}

__test_taint__(__set_taint__("hello"));
