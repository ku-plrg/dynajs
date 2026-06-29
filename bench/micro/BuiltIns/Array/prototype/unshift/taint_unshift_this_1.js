// @type taint
// @target es6+ Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var a = [tainted, "b"];
    var len = a.unshift("c");
    // @witness unshift returns a length (number), clean
    __assert_taint__(len, false);
}

__test_taint__(__set_taint__("hello"));
