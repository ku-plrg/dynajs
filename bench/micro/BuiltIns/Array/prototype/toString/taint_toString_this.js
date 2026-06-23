// @type taint
// @target es6+ Array.prototype.toString
// @feature builtin array-toString

function __test_taint__(tainted) {
    var a = ["a", tainted, "c"];
    var r = a.toString();
    // @witness ["a","x","c"].toString() => "a,x,c", tainted char at index 2
    __assert_taint__(r[0], false);
    __assert_taint__(r[1], false);
    __assert_taint__(r[2], true);
    __assert_taint__(r[3], false);
    __assert_taint__(r[4], false);
}

__test_taint__(__set_taint__("k"));
