// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "b"];
    // @witness found index inherits taint from the tainted fromIndex
    __assert_taint__(a.indexOf("b", tainted), true);
    // @witness fromIndex past the end finds nothing => -1, clean
    __assert_taint__(a.indexOf("b", tainted + 9), false);
}

__test_taint__(__set_taint__(1));
