// @type taint
// @target es6+ Array.prototype.map
// @feature builtin array-map
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.map(function (v) { return v; });
    // @witness always r[2] = "c", clean
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__("hello"));
