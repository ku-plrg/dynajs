// @type taint
// @target es6+ Array.prototype.reverse
// @feature builtin array-reverse
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.reverse();
    // @witness always r[1] = "b", clean
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__("hello"));
