// @type taint
// @target es6+ Number.isFinite
// @feature builtin isFinite

function __test_taint__(tainted) {
    var r = Number.isFinite(tainted);

    // @witness boolean result, clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(34));
