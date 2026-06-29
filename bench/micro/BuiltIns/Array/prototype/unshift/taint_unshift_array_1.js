// @type taint
// @target es5 Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var ret = tainted.unshift("q");
    // @witness always tainted[0] = "q" clean prepended literal
    __assert_taint__(tainted[0], false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
