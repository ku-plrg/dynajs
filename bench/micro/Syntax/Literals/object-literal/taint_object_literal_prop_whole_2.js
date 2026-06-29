// @type taint
// @target es5 object-literal
// @feature syntax object-prop-taint

function __test_taint__(tainted) {
    // @witness __test_taint__({p1: 'x1'}) => tainted.test = 'x1' tainted
    __assert_taint__(tainted.test, true);
}

__test_taint__(__set_taint__({test: "Hello"}));
