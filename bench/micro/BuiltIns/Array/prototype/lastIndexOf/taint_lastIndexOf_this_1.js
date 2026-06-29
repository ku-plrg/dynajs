// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness index/position, not content => clean
    __assert_taint__(a.lastIndexOf("b"), false);
}

__test_taint__(__set_taint__("hello"));
