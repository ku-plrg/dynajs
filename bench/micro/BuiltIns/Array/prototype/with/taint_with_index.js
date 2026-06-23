// @type taint
// @target es6+ Array.prototype.with
// @feature builtin array-with

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.with(tainted, "Z");
    // @witness tainted index does not taint the resulting elements
    __assert_taint__(r[0], false);
    __assert_taint__(r[1], false);
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__(1));
