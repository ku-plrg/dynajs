// @type taint
// @target es5 object-literal
// @feature syntax object-nesting

function __test_taint__(tainted) {
    // tainted is the inner object; taint flows down, not up
    var tol_a = {b: tainted, d: 0};
    // @witness __test_taint__({p1: 42}) => tol_a.b = {p1:42} tainted
    __assert_taint__(tol_a.b, true);
}

__test_taint__(__set_taint__({c: 1}));
