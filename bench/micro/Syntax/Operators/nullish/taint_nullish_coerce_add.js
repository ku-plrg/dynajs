// @type taint
// @target es5 nullish
// @feature syntax undefined-null-add

function __test_taint__(tainted) {
    // tainted === null, marked as a source; taint survives + coercion
    var tnu_c = tainted + tainted;
    // @witness null + null => 0, derived from tainted operands
    __assert_taint__(tnu_c, true);

    var tnu_d = tainted + 2;
    // @witness null + 2 => 2, derived from a tainted operand
    __assert_taint__(tnu_d, true);
}

__test_taint__(__set_taint__(null));
