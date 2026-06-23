// @type taint
// @target es5 object-literal
// @feature syntax object-nesting

function __test_taint__(tainted) {
    // tainted = {b:{c:1}}; the whole nested object is the source
    // @witness __test_taint__({b: {c: 1}}) => tainted = {b:{c:1}} tainted
    __assert_taint__(tainted, true);
    // @witness __test_taint__({b: {c: 1}}) => tainted.b = {c:1} tainted
    __assert_taint__(tainted.b, true);
    // @witness __test_taint__({b: {c: 1}}) => tainted.b.c = 1 tainted
    __assert_taint__(tainted.b.c, true);
}

__test_taint__(__set_taint__({b: {c: 1}}));
