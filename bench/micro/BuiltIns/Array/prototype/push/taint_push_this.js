// @type taint
// @target es6+ Array.prototype.push
// @feature builtin array-push

function __test_taint__(tainted) {
    var a = [tainted, "b"];
    var len = a.push("c");
    // @witness push returns a length (number) => clean
    __assert_taint__(len, false);
    // @witness pre-existing tainted "x" stays at index 0
    __assert_taint__(a[0], true);
    __assert_taint__(a[1], false);
    __assert_taint__(a[2], false);
}

__test_taint__(__set_taint__("hello"));
