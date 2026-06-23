// @type taint
// @target es6+ RegExp.sticky
// @feature builtin sticky

function __test_taint__(tainted) {
    // .sticky is a boolean property — rule 1 boolean => false
    var re = /b/y;

    // @witness boolean result, clean
    __assert_taint__(re.sticky, false);
}

__test_taint__(__set_taint__('hello'));
