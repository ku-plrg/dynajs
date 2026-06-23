// @type taint
// @target es6+ nullish-optional
// @feature syntax nullish

function __test_taint__(tainted) {
    var tnu_clean = { a: { b: "plain" } };
    __assert_taint__(tnu_clean?.a?.b, false);
}

__test_taint__(__set_taint__("x"));
