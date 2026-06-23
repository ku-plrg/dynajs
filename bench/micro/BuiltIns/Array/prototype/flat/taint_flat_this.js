// @type taint
// @target es6+ Array.prototype.flat
// @feature builtin array-flat

function __test_taint__(tainted) {
    var a = ["a", ["b", tainted], "d"];
    var r = a.flat();
    __assert_taint__(r[0], false);
    __assert_taint__(r[1], false);
    // @witness flat lifts nested tainted "x" into the result
    __assert_taint__(r[2], true);
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__("hello"));
