// @type taint
// @target es5 object-literal
// @feature syntax object-nesting

function __test_taint__(tainted) {
    // tainted = {b:{c:1}}; the whole nested object is the source
    // @witness whole nested object tainted
    __assert_taint__(tainted, true);
    // @witness nested object tainted by whole-object taint (coarse down)
    __assert_taint__(tainted.b, true);
    // @witness deeply nested value tainted (coarse down)
    __assert_taint__(tainted.b.c, true);
}

__test_taint__(__set_taint__({b: {c: 1}}));
