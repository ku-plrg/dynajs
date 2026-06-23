// @type taint
// @target es6+ Array.prototype.flat
// @feature builtin array-flat

function __test_taint__(tainted) {
    var a = ["a", ["b", ["c"]]];
    var r = a.flat(tainted);
    // @witness tainted depth argument does not taint flattened elements
    __assert_taint__(r[0], false);
    __assert_taint__(r[1], false);
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__(2));
