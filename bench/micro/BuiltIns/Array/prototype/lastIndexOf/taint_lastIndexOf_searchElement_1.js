// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf
// @done

function __test_taint__(tainted) {
    var a = ["a", "hello", "c"];
    // @witness lastIndexOf returns position number => clean
    __assert_taint__(a.lastIndexOf(tainted), false);
}

__test_taint__(__set_taint__("hello"));
