// @type taint
// @target es6+ array-destructuring
// @feature syntax array-destructuring
// @done

function __test_taint__(tainted) {
    var [tda_head, ...tda_rest] = ["h", "e", tainted];

    // @witness always "e"
    __assert_taint__(tda_rest[0], false);
}

__test_taint__(__set_taint__("tv"));
