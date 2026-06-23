// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf

function __test_taint__(tainted) {
    var a = ["a", "hello", "c"];
    // @witness found index inherits taint from the tainted search element
    __assert_taint__(a.lastIndexOf(tainted), true);
    // @witness tainted search element absent => -1, clean
    __assert_taint__(a.lastIndexOf(tainted + "z"), false);
}

__test_taint__(__set_taint__("hello"));
