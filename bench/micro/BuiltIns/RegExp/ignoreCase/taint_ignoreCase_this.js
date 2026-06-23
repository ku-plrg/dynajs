// @type taint
// @target es5 RegExp.ignoreCase
// @feature builtin ignoreCase

function __test_taint__(tainted) {
    // .ignoreCase is a boolean property — rule 1 boolean => false
    var re = /b/i;

    // @witness always re.ignoreCase is a boolean (not tainted content)
    __assert_taint__(re.ignoreCase, false);
}

__test_taint__(__set_taint__('hello'));
