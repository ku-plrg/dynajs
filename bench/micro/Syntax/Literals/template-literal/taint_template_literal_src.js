// @type taint
// @target es6+ template-literal
// @feature syntax template-literal

function __test_taint__(tainted) {
    var tt_out = `pre${tainted}post`;
    __assert_taint__(tt_out, true);
}

__test_taint__(__set_taint__("tv"));
