// @type taint
// @target es6+ Array.prototype.toReversed
// @feature builtin array-toReversed

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.toReversed();
    // @witness __test_taint__('x') => r[2] = 'x' tainted
    __assert_taint__(r[2], true);
}

__test_taint__(__set_taint__("hello"));
