// @type taint
// @target es6+ Array.prototype.flat
// @feature builtin array-flat
// @done

function __test_taint__(tainted) {
    var a = ["a", ["b", tainted], "d"];
    var r = a.flat();
    // @witness always r[3] = 'd', clean
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__("hello"));
