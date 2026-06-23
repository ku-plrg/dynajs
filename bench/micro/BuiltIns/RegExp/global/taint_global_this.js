// @type taint
// @target es5 RegExp.global
// @feature builtin global

function __test_taint__(tainted) {
    // .global is a boolean property — rule 1 boolean => false
    var re = /b/g;

    // @witness boolean result, clean
    __assert_taint__(re.global, false);
}

__test_taint__(__set_taint__('hello'));
