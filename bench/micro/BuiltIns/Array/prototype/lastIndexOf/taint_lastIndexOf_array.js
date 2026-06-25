// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf
// @done

function __test_taint__(tainted) {
    var r = tainted.lastIndexOf("a");
    // @witness always lastIndexOf returns position number => clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
