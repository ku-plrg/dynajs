// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf
// @done

function __test_taint__(tainted) {
    var a = ["a", "hello", "c"];
    // @witness indexOf returns position number => clean
    __assert_taint__(a.indexOf(tainted), false);
}

__test_taint__(__set_taint__("hello"));
