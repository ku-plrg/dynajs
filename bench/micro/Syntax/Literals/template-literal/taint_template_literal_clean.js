// @type taint
// @target es6+ template-literal
// @feature syntax template-literal

function __test_taint__(tainted) {
    var tt_clean = "plain";
    var tt_clean_out = `pre${tt_clean}post`;
    // @witness interpolated value "plain" is a clean literal, tainted arg unused in template => clean
    __assert_taint__(tt_clean_out, false);
}

__test_taint__(__set_taint__("x"));
