// @type taint
// @target es6+ Array.prototype.findLastIndex
// @feature builtin array-findLastIndex
// @done

function __test_taint__(tainted) {
    // @witness always tainted.findLastIndex(() => true) = 2, position (always clean)
    __assert_taint__(tainted.findLastIndex(function() { return true; }), false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
