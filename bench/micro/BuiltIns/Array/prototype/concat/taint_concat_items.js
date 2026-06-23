// @type taint
// @target es6+ Array.prototype.concat
// @feature builtin array-concat
// @done

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var r = a.concat([tainted, "d"]);
    // @witness always r[0] = 'a', clean
    __assert_taint__(r[0], false);
    // @witness always r[1] = 'b', clean
    __assert_taint__(r[1], false);
    // @witness __test_taint__('x') => r[2] = 'x'
    __assert_taint__(r[2], true);
    // @witness always r[3] = 'd', clean
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__("hello"));
