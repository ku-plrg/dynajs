// @type taint
// @target es5 RegExp.multiline
// @feature builtin multiline

function __test_taint__(tainted) {
    // .multiline is a boolean property — rule 1 boolean => false
    var re = /b/m;

    // @witness boolean result, clean
    __assert_taint__(re.multiline, false);
}

__test_taint__(__set_taint__('hello'));
