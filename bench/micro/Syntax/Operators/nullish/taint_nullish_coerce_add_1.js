// @type taint
// @target es5 nullish
// @feature syntax undefined-null-add

function __test_taint__(tainted) {
    // tainted === null, marked as a source; taint survives + coercion
    var tnu_c = tainted + tainted;
    // @witness __test_taint__(null) => tnu_c = 0 tainted (null+null coerced)
    __assert_taint__(tnu_c, true);
}

__test_taint__(__set_taint__(null));
