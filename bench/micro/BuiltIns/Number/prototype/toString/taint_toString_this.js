// @type taint
// @target es5 Number.prototype.toString
// @feature builtin toString

function __test_taint__(tainted) {
    var r = tainted.toString();

    // @witness __test_taint__(34) => r[0]='3' (content digit)
    __assert_taint__(r[0], true);

    // @witness __test_taint__(34) => r[1]='4' (content digit)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__(34));
