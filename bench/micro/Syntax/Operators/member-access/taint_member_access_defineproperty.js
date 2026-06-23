// @type taint
// @target es5 member-access
// @feature syntax prop-map

function __test_taint__(tainted) {
    // one tainted prop among others => container mixed => clean
    var tm_a = {b: tainted, c: "World"};
    __assert_taint__(tm_a.b, true);
    __assert_taint__(tm_a.c, false);
    // @witness mixed props => not all-tainted => clean
    __assert_taint__(tm_a, false);

    // single tainted prop => whole tainted; defineProperty of a clean prop makes it mixed
    var tm_e = {b: tainted};
    // @witness all (one) props tainted => whole tainted
    __assert_taint__(tm_e, true);
    Object.defineProperty(tm_e, 'd', {value: 'Test'});
    // @witness defined clean property is clean
    __assert_taint__(tm_e.d, false);
    // @witness adding a clean property makes the container mixed => clean
    __assert_taint__(tm_e, false);
}

__test_taint__(__set_taint__("Hello"));
