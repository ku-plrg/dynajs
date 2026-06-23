// @type taint
// @target es6+ closure
// @feature syntax callback-map

function __test_taint__(tainted) {
    // tainted = {test:'Hello'}; a whole-tainted object element
    var tcl_b = {test: 'World'};
    var tcl_c = [tainted, tcl_b];
    // @witness tainted object element vs clean object element
    __assert_taint__(tcl_c[0], true);
    __assert_taint__(tcl_c[1], false);

    var tcl_d = tcl_c.map((x) => x);
    // @witness identity map preserves per-element taint
    __assert_taint__(tcl_d[0], true);
    __assert_taint__(tcl_d[1], false);

    var tcl_e = tcl_c.map((x) => x.test);
    // @witness mapped field: tainted element's prop (coarse) vs clean element's prop
    __assert_taint__(tcl_e[0], true);
    __assert_taint__(tcl_e[1], false);

    var tcl_f = tcl_c.map((x) => x.toString());
    // @witness toString => "[object Object]" is structural => clean
    __assert_taint__(tcl_f[0], false);
    __assert_taint__(tcl_f[1], false);

    var tcl_g = tcl_c.map((x) => Object.isFrozen(x));
    // @witness boolean result => clean
    __assert_taint__(tcl_g[0], false);
    __assert_taint__(tcl_g[1], false);
}

__test_taint__(__set_taint__({test: 'Hello'}));
