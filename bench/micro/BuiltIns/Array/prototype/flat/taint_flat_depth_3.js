// @type taint
// @target es6+ Array.prototype.flat
// @feature builtin array-flat
// @done

function __test_taint__(tainted) {
    var a = ["a", ["b", ["c"]]];
    var r = a.flat(tainted);
    // @witness depth is index/position, not content => clean
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__(2));
