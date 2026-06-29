// @type taint
// @target es6+ Array.prototype.concat
// @feature builtin array-concat
// @done

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var r = a.concat([tainted, "d"]);
    // @witness always r[1] = 'b', clean
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__("hello"));
