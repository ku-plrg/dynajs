// @type taint
// @target es5 Number
// @feature builtin Number

function __test_taint__(tainted) {
    // Number(tainted) where tainted is '34'; content number flows through
    var r = Number(tainted);

    // @witness __test_taint__('42') => r = 42 tainted
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__('34'));
