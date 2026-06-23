// @type taint
// @target es6+ Number.isSafeInteger
// @feature builtin isSafeInteger

function __test_taint__(tainted) {
    var r = Number.isSafeInteger(tainted);

    // @witness boolean result, clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(34));
