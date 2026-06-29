// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d"];
    a.fill(tainted, 1, 3);
    // @witness always a[0] = 'a', clean
    __assert_taint__(a[0], false);
}

__test_taint__(__set_taint__("hello"));
