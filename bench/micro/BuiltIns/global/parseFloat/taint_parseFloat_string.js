// @type taint
// @target es5 parseFloat
// @feature builtin parseFloat

function __test_taint__(tainted) {
    var r = parseFloat(tainted);

    // @witness __test_taint__('3.5') => r=3.5 (content number from tainted string)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__('3.5'));
