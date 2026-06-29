// @type taint
// @target es6+ array-destructuring
// @feature syntax array-destructuring
// @done

function __test_taint__(tainted) {
    var [tda_a, tda_b] = [tainted, "clean"];
    // @witness always "clean"
    __assert_taint__(tda_b, false);
}

__test_taint__(__set_taint__("tv"));
