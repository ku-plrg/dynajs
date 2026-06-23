// @type taint
// @target es5 Number.prototype.toExponential
// @feature builtin toExponential

function __test_taint__(tainted) {
    // seed 34, toExponential(1) => "3.4e+1"
    var r = tainted.toExponential(1);

    // @witness __test_taint__(34) => r[0]='3' (leading content digit)
    __assert_taint__(r[0], true);

    // @witness always r[1]='.' (structural separator)
    __assert_taint__(r[1], false);

    // @witness __test_taint__(34) => r[2]='4' (content digit)
    __assert_taint__(r[2], true);

    // @witness always r[3]='e' (structural exponent marker)
    __assert_taint__(r[3], false);

    // @witness always r[4]='+' (structural sign)
    __assert_taint__(r[4], false);
}

__test_taint__(__set_taint__(34));
