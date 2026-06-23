// @type taint
// @target es5 Object.prototype.valueOf
// @feature builtin valueOf

function __test_taint__(tainted) {
    var o = {p: tainted};
    var r = o.valueOf();
    // @witness __test_taint__('hello') => r.p='hello'; valueOf returns same obj (tainted prop)
    __assert_taint__(r.p, true);

    // @witness single prop, all-tainted => whole object tainted
    __assert_taint__(r, true);

    // mixed: one tainted, one clean => whole container false
    var o2 = {p: tainted, q: 'clean'};
    var r2 = o2.valueOf();
    // @witness mixed props; whole object not all-tainted
    __assert_taint__(r2, false);
}

__test_taint__(__set_taint__('hello'));
