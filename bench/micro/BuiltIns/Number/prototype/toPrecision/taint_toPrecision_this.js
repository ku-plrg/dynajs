// @type taint
// @target es5 Number.prototype.toPrecision
// @feature builtin toPrecision

function __test_taint__(tainted) {
    // seed 34, toPrecision(4) => "34.00"
    var r = tainted.toPrecision(4);

    // @witness __test_taint__(34) => r[0] = '3' tainted
    __assert_taint__(r[0], true);

    // @witness __test_taint__(34) => r[1] = '4' tainted
    __assert_taint__(r[1], true);

    // @witness r[2] = '.' structural decimal point inserted by toPrecision, clean
    __assert_taint__(r[2], false);

    // @witness r[3] = '0' padding zero, not from tainted value, clean
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__(34));
