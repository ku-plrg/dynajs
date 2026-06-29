// @type taint
// @target es6+ closure
// @feature syntax callback-map
// @done

function __test_taint__(tainted) {
    // tainted = a whole-tainted object element
    var tcl_b = {test: 'World'};
    var tcl_c = [tainted, tcl_b];

    var tcl_d = tcl_c.map((x) => x);

    var tcl_f = tcl_c.map((x) => x.toString());

    var tcl_g = tcl_c.map((x) => Object.isFrozen(x));
    // @witness boolean result, clean
    __assert_taint__(tcl_g[0], false);
}

__test_taint__(__set_taint__({test: 'Hello'}));
