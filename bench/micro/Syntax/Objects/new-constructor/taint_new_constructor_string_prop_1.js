// @type taint
// @target es5 member-access
// @feature syntax member-access
// @done

function __test_taint__(tainted) {
    var tnc_z = tainted + ", World!";
    var tnc_q = {};
    tnc_q.a = tnc_z;

    // @witness __test_taint__('x') => tnc_q.a[0] = 'x' tainted
    __assert_taint__(tnc_q.a[0], true);
}

__test_taint__(__set_taint__("Hello"));
