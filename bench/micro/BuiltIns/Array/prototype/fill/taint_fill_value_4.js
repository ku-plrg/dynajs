// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d"];
    a.fill(tainted, 1, 3);
    // @witness always a[3] = 'd', clean
    __assert_taint__(a[3], false);
}

__test_taint__(__set_taint__("hello"));
