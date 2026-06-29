// @type taint
// @target es5 Array.prototype.shift
// @feature builtin array-shift
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness always a.shift() = "c", clean
    __assert_taint__(a.shift(), false);
}

__test_taint__(__set_taint__("hello"));
