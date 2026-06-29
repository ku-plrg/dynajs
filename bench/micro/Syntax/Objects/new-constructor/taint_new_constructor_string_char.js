// @type taint
// @target es5 member-access
// @feature syntax member-access
// @done

function __test_taint__(tainted) {

    var tnc_w = {};
    tnc_w.a = tainted[1];
    // @witness __test_taint__('x') => tnc_w.a = 'x' tainted
    __assert_taint__(tnc_w.a, true);
}

__test_taint__(__set_taint__("Hello, World!"));
