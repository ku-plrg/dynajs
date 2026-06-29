// @type taint
// @target es6+ Array.prototype.concat
// @feature builtin array-concat
// @done

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var r = a.concat([tainted, "d"]);
    // @witness __test_taint__('x') => r[2] = 'x'
    __assert_taint__(r[2], true);
}

__test_taint__(__set_taint__("hello"));
