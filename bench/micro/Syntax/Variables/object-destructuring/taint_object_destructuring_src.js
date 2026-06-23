// @type taint
// @target es6+ object-destructuring
// @feature syntax object-destructuring

function __test_taint__(tainted) {
    var { p: tdo_p, q: tdo_q } = { p: tainted, q: "clean" };
    __assert_taint__(tdo_p, true);
    __assert_taint__(tdo_q, false);
}

__test_taint__(__set_taint__("tv"));
