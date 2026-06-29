// @type taint
// @target es6+ optional-chaining
// @feature syntax optional-chaining

function __test_taint__(tainted) {
    var to_obj = { p: tainted };
    var to_null = null;
    // @witness null?.p short-circuits to undefined, discarding any access => clean
    __assert_taint__(to_null?.p, false);
}

__test_taint__(__set_taint__("tv"));
