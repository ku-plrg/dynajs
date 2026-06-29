// @type taint
// @target es6+ Array.prototype.concat
// @feature builtin array-concat
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b"];
    var r = a.concat(["c", "d"]);
    // @witness __test_taint__('x') => r[0] = 'x'
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__("hello"));
