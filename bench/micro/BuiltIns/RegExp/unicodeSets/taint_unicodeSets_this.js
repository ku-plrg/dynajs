// @type taint
// @target es6+ RegExp.unicodeSets
// @feature builtin unicodeSets

function __test_taint__(tainted) {
    // @witness boolean result, clean
    __assert_taint__(tainted.unicodeSets, false);
}

__test_taint__(__set_taint__(/b/v));
