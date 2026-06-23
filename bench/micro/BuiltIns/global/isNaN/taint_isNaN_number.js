// @type taint
// @target es5 isNaN
// @feature builtin isNaN

function __test_taint__(tainted) {
    var r = isNaN(tainted);

    // @witness boolean result; tainted input only configures the check
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__('hello'));
