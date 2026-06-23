// @type taint
// @target es6+ object-destructuring
// @feature syntax object-destructuring

function __test_taint__(tainted) {
    var { val: tdo_renamed } = { val: tainted };
    __assert_taint__(tdo_renamed, true);
}

__test_taint__(__set_taint__("tv"));
