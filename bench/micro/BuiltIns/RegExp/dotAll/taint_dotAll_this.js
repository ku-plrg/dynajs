// @type taint
// @target es6+ RegExp.dotAll
// @feature builtin dotAll

function __test_taint__(tainted) {
    // .dotAll is a boolean property — rule 1 boolean => false
    var re = /b/s;

    // @witness boolean result, clean
    __assert_taint__(re.dotAll, false);
}

__test_taint__(__set_taint__('hello'));
