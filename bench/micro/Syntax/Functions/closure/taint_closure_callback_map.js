// @type taint
// @target es6+ closure
// @feature syntax callback-map
// @done

function __test_taint__(tainted) {
    // tainted = a whole-tainted object element
    var tcl_b = {test: 'World'};
    var tcl_c = [tainted, tcl_b];
    // @witness __test_taint__({p1: 'x1'}) => tcl_c[0] = {p1:'x1'} tainted
    __assert_taint__(tcl_c[0], true);
    // @witness clean sibling element, clean
    __assert_taint__(tcl_c[1], false);

    var tcl_d = tcl_c.map((x) => x);
    // @witness __test_taint__({p1: 'x1'}) => tcl_d[0] = {p1:'x1'} tainted
    __assert_taint__(tcl_d[0], true);
    // @witness clean sibling element, clean
    __assert_taint__(tcl_d[1], false);

    var tcl_f = tcl_c.map((x) => x.toString());
    // @witness toString => "[object Object]" structural, clean
    __assert_taint__(tcl_f[0], false);
    // @witness toString => "[object Object]" structural, clean
    __assert_taint__(tcl_f[1], false);

    var tcl_g = tcl_c.map((x) => Object.isFrozen(x));
    // @witness boolean result, clean
    __assert_taint__(tcl_g[0], false);
    // @witness boolean result, clean
    __assert_taint__(tcl_g[1], false);
}

__test_taint__(__set_taint__({test: 'Hello'}));
