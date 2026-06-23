// @type taint
// @target es5 member-access
// @feature syntax member-access

function __test_taint__(tainted) {
    var tnc_z = tainted + ", World!";
    var tnc_q = {};
    tnc_q.a = tnc_z;

    // @witness mixed (tainted + clean) => not all-tainted, clean
    __assert_taint__(tnc_q, false);
    // @witness __test_taint__("Hello") => tnc_z[0] = 'H' tainted
    __assert_taint__(tnc_z[0], true);
    // @witness __test_taint__("Hello") => tnc_z[4] = 'o' tainted
    __assert_taint__(tnc_z[4], true);
    // @witness __test_taint__("Hello") => tnc_q.a[0] = 'H' tainted
    __assert_taint__(tnc_q.a[0], true);
    // @witness __test_taint__("Hello") => tnc_q.a[4] = 'o' tainted
    __assert_taint__(tnc_q.a[4], true);
    // @witness clean literal char from ", World!" suffix, clean
    __assert_taint__(tnc_q.a[5], false);
}

__test_taint__(__set_taint__("Hello"));
