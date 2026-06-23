// @type taint
// @target es5 member-access
// @feature syntax member-access

function __test_taint__(tainted) {
    var tnc_z = tainted + ", World!";
    var tnc_q = {};
    tnc_q.a = tnc_z;

    // @witness container holds a mixed string => not all-tainted => clean
    __assert_taint__(tnc_q, false);
    // @witness tainted-derived chars
    __assert_taint__(tnc_z[0], true);
    __assert_taint__(tnc_z[4], true);
    // @witness same char-level taint after storing in q.a
    __assert_taint__(tnc_q.a[0], true);
    __assert_taint__(tnc_q.a[4], true);
    // @witness clean literal char (", World!")
    __assert_taint__(tnc_q.a[5], false);
}

__test_taint__(__set_taint__("Hello"));
