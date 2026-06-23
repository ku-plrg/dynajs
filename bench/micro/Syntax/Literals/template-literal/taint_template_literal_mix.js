// @type taint
// @target es6+ template-literal
// @feature syntax template-literal

function __test_taint__(tainted) {
    var tt_mix_out = `${"a"}-${tainted}-${"b"}`;
    __assert_taint__(tt_mix_out, true);
}

__test_taint__(__set_taint__("tv"));
