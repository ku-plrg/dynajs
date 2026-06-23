// @type taint
// @target es5 member-access
// @feature syntax member-access

function __test_taint__(tainted) {
    var tnc_z = tainted;
    // @witness __test_taint__("Hello, World!") => tnc_z = "Hello, World!" tainted
    __assert_taint__(tnc_z, true);
    // @witness __test_taint__("Hello, World!") => tnc_z[1] = 'e' tainted
    __assert_taint__(tnc_z[1], true);

    var tnc_w = {};
    tnc_w.a = tnc_z[1];
    // @witness __test_taint__("Hello, World!") => tnc_w.a = 'e' tainted
    __assert_taint__(tnc_w.a, true);
}

__test_taint__(__set_taint__("Hello, World!"));
