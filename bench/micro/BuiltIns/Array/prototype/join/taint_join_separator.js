// @type taint
// @target es6+ Array.prototype.join
// @feature builtin array-join

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.join(tainted);
    // @witness ["a","b","c"].join("x") => "axbxc", tainted separators at 1,3
    __assert_taint__(r[0], false);
    __assert_taint__(r[1], true);
    __assert_taint__(r[2], false);
    __assert_taint__(r[3], true);
    __assert_taint__(r[4], false);
}

__test_taint__(__set_taint__("-"));
