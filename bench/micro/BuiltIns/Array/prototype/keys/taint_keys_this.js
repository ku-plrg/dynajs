// @type taint
// @target es6+ Array.prototype.keys
// @feature builtin array-keys
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = [...a.keys()];
    // @witness index/position, not content => clean
    __assert_taint__(r[0], false);
    // @witness index/position, not content => clean
    __assert_taint__(r[1], false);
    // @witness index/position, not content => clean
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__("hello"));
