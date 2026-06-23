// @type taint
// @target es5 Number.prototype.toFixed
// @feature builtin toFixed

function __test_taint__(tainted) {
    var r = tainted.toFixed(1);
    // r = "12.0" for seed 12

    // @witness __test_taint__(12) => r[0]='1' (content digit)
    __assert_taint__(r[0], true);

    // @witness __test_taint__(12) => r[1]='2' (content digit)
    __assert_taint__(r[1], true);

    // @witness always r[2]='.' (structural separator inserted by toFixed)
    __assert_taint__(r[2], false);

    // @witness always r[3]='0' (padding digit, not from tainted value)
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__(12));
