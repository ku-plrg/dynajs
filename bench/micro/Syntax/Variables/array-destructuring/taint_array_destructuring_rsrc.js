// @type taint
// @target es6+ array-destructuring
// @feature syntax array-destructuring

function __test_taint__(tainted) {
    var [tda_head, ...tda_rest] = ["h", tainted];
    __assert_taint__(tda_rest[0], true);
}

__test_taint__(__set_taint__("tv"));
