// @type taint
// @target es5 Number.prototype.toLocaleString
// @feature builtin toLocaleString

function __test_taint__(tainted) {
    // seed 34; call with no locale args to get a stable simple decimal string
    var r = tainted.toLocaleString('en', {useGrouping: false});

    // @witness __test_taint__(34) => r[0]='3' (content digit)
    __assert_taint__(r[0], true);

    // @witness __test_taint__(34) => r[1]='4' (content digit)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__(34));
