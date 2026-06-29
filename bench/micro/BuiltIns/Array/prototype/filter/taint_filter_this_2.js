// @type taint
// @target es6+ Array.prototype.filter
// @feature builtin array-filter
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.filter(function (v) { return true; });
    // @witness always r[1] = 'b', clean
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__("hello"));
