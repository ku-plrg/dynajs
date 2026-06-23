// @type taint
// @target es5 parseInt
// @feature builtin parseInt

function __test_taint__(tainted) {
    var r = parseInt(tainted);

    // @witness __test_taint__('34') => r=34 (content number from tainted string)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__('34'));
