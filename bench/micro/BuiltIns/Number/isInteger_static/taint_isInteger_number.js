// @type taint
// @target es6+ Number.isInteger
// @feature builtin isInteger

function __test_taint__(tainted) {
    var r = Number.isInteger(tainted);

    // @witness boolean predicate; tainted input cannot propagate into a boolean result
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(34));
