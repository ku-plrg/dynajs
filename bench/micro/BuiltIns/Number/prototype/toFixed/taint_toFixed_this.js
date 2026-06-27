// @type taint
// @target es5 Number.prototype.toFixed
// @feature builtin toFixed

function __test_taint__(tainted) {
    var r = tainted.toFixed(1);
    // r = "12.0" for seed 12

    // @witness __test_taint__(42) => r[0] = '4' tainted
    __assert_taint__(r[0], true);

    // @witness __test_taint__(42) => r[1] = '2' tainted
    __assert_taint__(r[1], true);

    // @witness r[2] = '.' structural separator inserted by toFixed, clean
    __assert_taint__(r[2], false);

    // @witness r[3] = '0' padding digit, not from tainted value, clean
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__(12));
