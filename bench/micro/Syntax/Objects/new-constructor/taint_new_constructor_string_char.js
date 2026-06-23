// @type taint
// @target es5 member-access
// @feature syntax member-access

function __test_taint__(tainted) {
    var tnc_z = tainted;
    // @witness whole tainted string
    __assert_taint__(tnc_z, true);
    // @witness char of a tainted string
    __assert_taint__(tnc_z[1], true);

    var tnc_w = {};
    tnc_w.a = tnc_z[1];
    // @witness tainted char stored into an object field stays tainted
    __assert_taint__(tnc_w.a, true);
}

__test_taint__(__set_taint__("Hello, World!"));
