// @type taint
// @target es6 RegExp.flags
// @feature builtin flags

function __test_taint__(tainted) {
    // flags come from the regexp literal, not from tainted data
    var re = /ab/gi;
    var f = re.flags;

    // @witness always f[0] is a flag char from clean literal (not tainted)
    __assert_taint__(f[0], false);

    // @witness always f[1] is a flag char from clean literal (not tainted)
    __assert_taint__(f[1], false);
}

__test_taint__(__set_taint__('hello'));
