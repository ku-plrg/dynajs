// @type taint
// @target es6+ Array.prototype.slice
// @feature builtin array-slice
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", tainted, "d"];
    var r = a.slice(1, 3);
    // @witness always r[0] = "b", clean
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__("hello"));
