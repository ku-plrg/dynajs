// @type taint
// @target es5 eval
// @feature builtin eval

function __test_taint__(tainted) {
    // tainted is '1+1'; eval computes result derived from tainted source expression
    var r = eval(tainted);

    // @witness __test_taint__('1+1') => r=2 (content derived from tainted expression)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__('1+1'));
