// @type taint
// @target es5 object-literal
// @feature syntax object-nesting

function __test_taint__(tainted) {
    // @witness __test_taint__({p1: {p2: 42}}) => tainted.b.c = 42 tainted
    __assert_taint__(tainted.b.c, true);
}

__test_taint__(__set_taint__({b: {c: 1}}));
