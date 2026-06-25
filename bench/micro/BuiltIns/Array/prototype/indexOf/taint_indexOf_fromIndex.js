// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "b"];
    // @witness indexOf returns position number => clean
    __assert_taint__(a.indexOf("b", tainted), false);
}

__test_taint__(__set_taint__(1));
