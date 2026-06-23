// @type taint
// @target es5 RegExp.global
// @feature builtin global
// @done

function __test_taint__(tainted) {

    // @witness boolean result, clean
    __assert_taint__(tainted.global, false);
}

__test_taint__(__set_taint__(/b/g));
