// @type taint
// @target es6+ computed-property
// @feature syntax computed-property

function __test_taint__(tainted) {
    var tcp_obj2 = { [tainted]: "clean" };
    __assert_taint__(tcp_obj2["dynk"], false);
}

__test_taint__(__set_taint__("dynk"));
