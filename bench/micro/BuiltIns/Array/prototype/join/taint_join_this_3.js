// @type taint
// @target es6+ Array.prototype.join
// @feature builtin array-join
// @done

function __test_taint__(tainted) {
    var a = ["a", tainted, "c"];
    var r = a.join(",");   // "a,hello,c"
    // @witness __test_taint__('x') => r[2] = 'x' tainted (first char of tainted element)
    __assert_taint__(r[2], true);
}

__test_taint__(__set_taint__("hello"));
