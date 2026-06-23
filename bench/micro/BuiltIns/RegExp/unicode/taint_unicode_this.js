// @type taint
// @target es6 RegExp.unicode
// @feature builtin unicode

function __test_taint__(tainted) {
    // .unicode is a boolean property — rule 1 boolean => false
    var re = /b/u;

    // @witness always re.unicode is a boolean (not tainted content)
    __assert_taint__(re.unicode, false);
}

__test_taint__(__set_taint__('hello'));
