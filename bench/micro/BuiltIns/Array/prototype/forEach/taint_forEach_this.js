// @type taint
// @target es6+ Array.prototype.forEach
// @feature builtin array-forEach
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.forEach(function (v) { return v; });
    // @witness forEach always returns undefined, clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__("hello"));
