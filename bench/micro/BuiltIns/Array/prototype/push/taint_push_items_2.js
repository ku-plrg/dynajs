// @type taint
// @target es6+ Array.prototype.push
// @feature builtin array-push
// @done

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var len = a.push(tainted);
    // @witness always a[0] = "a", clean
    __assert_taint__(a[0], false);
}

__test_taint__(__set_taint__("hello"));
