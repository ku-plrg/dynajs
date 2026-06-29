// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness lastIndexOf returns -1 (not found), clean
    __assert_taint__(a.lastIndexOf("z"), false);
}

__test_taint__(__set_taint__("hello"));
