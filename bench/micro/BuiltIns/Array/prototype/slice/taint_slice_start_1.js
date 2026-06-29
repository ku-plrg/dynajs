// @type taint
// @target es6+ Array.prototype.slice
// @feature builtin array-slice
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d"];
    var r = a.slice(tainted, 3);
    // @witness index/position, not content => clean
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__(1));
