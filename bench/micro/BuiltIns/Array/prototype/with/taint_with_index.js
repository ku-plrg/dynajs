// @type taint
// @target es6+ Array.prototype.with
// @feature builtin array-with
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.with(tainted, "Z");
    // @witness index/position, not content => clean
    __assert_taint__(r[0], false);
    // @witness index/position, not content => clean
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__(1));
