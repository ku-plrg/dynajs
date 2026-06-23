// @type taint
// @target es5 Boolean
// @feature builtin Boolean

function __test_taint__(tainted) {
    var r = Boolean(tainted);

    // @witness boolean result, clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__('hello'));
