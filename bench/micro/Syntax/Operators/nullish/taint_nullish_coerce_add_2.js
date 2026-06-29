// @type taint
// @target es5 nullish
// @feature syntax undefined-null-add

function __test_taint__(tainted) {
    // tainted === null, marked as a source; taint survives + coercion
    var tnu_c = tainted + tainted;

    var tnu_d = tainted + 2;
    // @witness __test_taint__(null) => tnu_d = 2 tainted (null+2 coerced)
    __assert_taint__(tnu_d, true);
}

__test_taint__(__set_taint__(null));
