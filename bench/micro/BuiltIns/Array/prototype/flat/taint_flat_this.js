// @type taint
// @target es6+ Array.prototype.flat
// @feature builtin array-flat

function __test_taint__(tainted) {
    var a = ["a", ["b", tainted], "d"];
    var r = a.flat();
    // @witness always r[0] = 'a', clean
    __assert_taint__(r[0], false);
    // @witness always r[1] = 'b', clean
    __assert_taint__(r[1], false);
    // @witness __test_taint__('hello') => r[2] = 'hello' tainted
    __assert_taint__(r[2], true);
    // @witness always r[3] = 'd', clean
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__("hello"));
