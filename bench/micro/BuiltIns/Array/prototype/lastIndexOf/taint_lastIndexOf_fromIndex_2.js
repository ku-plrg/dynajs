// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf
// @done

function __test_taint__(tainted) {
    var a = ["b", "a", "b", "c"];
    // @witness lastIndexOf returns -1 (not found), clean
    __assert_taint__(a.lastIndexOf("b", tainted - 12), false);
}

__test_taint__(__set_taint__(2));
