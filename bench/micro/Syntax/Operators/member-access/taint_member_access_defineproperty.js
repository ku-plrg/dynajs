// @type taint
// @target es5 member-access
// @feature syntax prop-map

function __test_taint__(tainted) {
    // one tainted prop among others => container mixed => clean
    var tm_a = {b: tainted, c: "World"};
    // @witness __test_taint__('x') => tm_a.b = 'x' tainted
    __assert_taint__(tm_a.b, true);
    // @witness clean literal prop, clean
    __assert_taint__(tm_a.c, false);
    // @witness mixed (tainted + clean) => not all-tainted, clean
    __assert_taint__(tm_a, false);

    // single tainted prop => whole tainted; defineProperty of a clean prop makes it mixed
    var tm_e = {b: tainted};
    // @witness __test_taint__('x') => tm_e = {b:'x'} tainted (all props tainted)
    __assert_taint__(tm_e, true);
    Object.defineProperty(tm_e, 'd', {value: 'Test'});
    // @witness clean defined property, clean
    __assert_taint__(tm_e.d, false);
    // @witness mixed (tainted + clean) => not all-tainted, clean
    __assert_taint__(tm_e, false);
}

__test_taint__(__set_taint__("Hello"));
