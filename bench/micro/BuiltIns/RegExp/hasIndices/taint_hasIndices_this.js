// @type taint
// @target es6+ RegExp.hasIndices
// @feature builtin hasIndices

function __test_taint__(tainted) {
    // @witness boolean result, clean
    __assert_taint__(tainted.hasIndices, false);
}

__test_taint__(__set_taint__(/b/d));
