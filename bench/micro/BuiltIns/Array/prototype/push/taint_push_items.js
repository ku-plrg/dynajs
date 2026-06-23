// @type taint
// @target es6+ Array.prototype.push
// @feature builtin array-push

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var len = a.push(tainted);
    // @witness push returns a length (number) => clean
    __assert_taint__(len, false);
    __assert_taint__(a[0], false);
    __assert_taint__(a[1], false);
    // @witness pushed tainted item "x" lands at the end
    __assert_taint__(a[a.length - 1], true);
}

__test_taint__(__set_taint__("hello"));
