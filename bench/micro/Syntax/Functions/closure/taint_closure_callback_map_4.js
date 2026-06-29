// @type taint
// @target es6+ closure
// @feature syntax callback-map
// @done

function __test_taint__(tainted) {
    // tainted = a whole-tainted object element
    var tcl_b = {test: 'World'};
    var tcl_c = [tainted, tcl_b];

    var tcl_d = tcl_c.map((x) => x);
    // @witness clean sibling element, clean
    __assert_taint__(tcl_d[1], false);
}

__test_taint__(__set_taint__({test: 'Hello'}));
