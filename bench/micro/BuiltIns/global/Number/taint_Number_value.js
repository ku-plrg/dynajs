// @type taint
// @target es5 Number
// @feature builtin Number

function __test_taint__(tainted) {
    // Number(tainted) where tainted is '34'; content number flows through
    var r = Number(tainted);

    // @witness __test_taint__('34') => r=34 (content number from tainted string)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__('34'));
