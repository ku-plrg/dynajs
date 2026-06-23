// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf

function __test_taint__(tainted) {
    var a = ["b", "a", "b", "c"];
    // @witness found index inherits taint from the tainted fromIndex
    __assert_taint__(a.lastIndexOf("b", tainted), true);
    // @witness negative fromIndex finds nothing => -1, clean
    __assert_taint__(a.lastIndexOf("b", tainted - 12), false);
}

__test_taint__(__set_taint__(2));
