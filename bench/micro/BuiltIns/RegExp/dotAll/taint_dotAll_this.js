// @type taint
// @target es6+ RegExp.dotAll
// @feature builtin dotAll
// @done

function __test_taint__(tainted) {

    // @witness boolean result, clean
    __assert_taint__(tainted.dotAll, false);
}

__test_taint__(__set_taint__(/b/s));
