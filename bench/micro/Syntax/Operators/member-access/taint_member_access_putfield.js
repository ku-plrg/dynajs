// @type taint
// @target es5 member-access
// @feature syntax putfield

function __test_taint__(tainted) {
    // tainted = a whole-tainted object; chained assignment shares the reference
    var tm_b = {};
    var tm_a = (tm_b.styles = tainted);
    // @witness __test_taint__({}) => tm_b.styles = {} tainted
    __assert_taint__(tm_b.styles, true);
    // @witness __test_taint__({}) => tm_a = {} tainted (chained assignment)
    __assert_taint__(tm_a, true);
}

__test_taint__(__set_taint__({}));
