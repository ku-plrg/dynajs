// @type taint
// @target es6+ closure
// @feature syntax callback-map
// @done

function __test_taint__(tainted) {
    // tainted = a whole-tainted object element
    var tcl_b = {test: 'World'};
    var tcl_c = [tainted, tcl_b];

    var tcl_d = tcl_c.map((x) => x);
    // @witness __test_taint__({p1: 'x1'}) => tcl_d[0] = {p1:'x1'} tainted
    __assert_taint__(tcl_d[0], true);
}

__test_taint__(__set_taint__({test: 'Hello'}));
