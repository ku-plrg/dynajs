// @type taint
// @target es5 Object
// @feature syntax object-taint
// @done

function __test_taint__(tainted) {
    // @witness __test_taint__({p1: 42}) => tainted.a = 42 tainted
    __assert_taint__(tainted.a, true);
}

__test_taint__(__set_taint__({a: 1}));
