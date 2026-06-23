// @type taint
// @target es6+ Array.prototype.values
// @feature builtin array-values

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = [...a.values()];
    // @witness __test_taint__('hello') => r[0] = 'hello' tainted
    __assert_taint__(r[0], true);
    // @witness always r[1] = "b", clean
    __assert_taint__(r[1], false);
    // @witness always r[2] = "c", clean
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__("hello"));
