// @type taint
// @target es6+ Array.prototype.concat
// @feature builtin array-concat
// @done

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var r = a.concat([tainted, "d"]);
    // @witness always r[3] = 'd', clean
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__("hello"));
