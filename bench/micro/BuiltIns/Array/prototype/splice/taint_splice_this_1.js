// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c", "d", "e"];

    var r = a.splice(1, 2);
    // @witness always r[0] = "b", clean
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__("hello"));
