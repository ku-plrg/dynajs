// @type taint
// @target es5 var-declaration
// @feature syntax var-declaration

function __test_taint__(tainted) {
    var tvd_clean = "plain";
    __assert_taint__(tvd_clean, false);
}

__test_taint__(__set_taint__("x"));
