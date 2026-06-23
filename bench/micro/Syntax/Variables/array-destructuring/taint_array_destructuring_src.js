// @type taint
// @target es6+ array-destructuring
// @feature syntax array-destructuring

function __test_taint__(tainted) {
    var [tda_a, tda_b] = [tainted, "clean"];
    __assert_taint__(tda_a, true);
    __assert_taint__(tda_b, false);
}

__test_taint__(__set_taint__("tv"));
