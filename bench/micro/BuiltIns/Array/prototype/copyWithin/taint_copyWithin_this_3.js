// @type taint
// @target es6+ Array.prototype.copyWithin
// @feature builtin array-copyWithin
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d", tainted];
    a.copyWithin(0, 3, 5);
    // @witness always a[2] = 'c', clean
    __assert_taint__(a[2], false);
}

__test_taint__(__set_taint__("hello"));
