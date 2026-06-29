// @type taint
// @target es6+ Array.prototype.toSpliced
// @feature builtin array-toSpliced

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.toSpliced(1, tainted);
    // @witness index/position, not content => clean
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__(1));
