// @type taint
// @target es5 Object.seal
// @feature builtin seal

function __test_taint__(tainted) {
    var r = Object.seal({p: tainted});
    // @witness __test_taint__('hello') => r.p = 'hello' tainted
    __assert_taint__(r.p, true);

    // mixed: one tainted, one clean => whole container false
    var r2 = Object.seal({p: tainted, q: 'clean'});
    // @witness mixed (tainted + clean) => not all-tainted, clean
    __assert_taint__(r2, false);
}

__test_taint__(__set_taint__('hello'));
