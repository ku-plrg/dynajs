// @type taint
// @target es5 member-access
// @feature syntax prop-map

function __test_taint__(tainted) {
    // one tainted prop among others => container mixed => clean
    var tm_a = {b: tainted, c: "World"};

    // single tainted prop => whole tainted; defineProperty of a clean prop makes it mixed
    var tm_e = {b: tainted};
    Object.defineProperty(tm_e, 'd', {value: 'Test'});
    // @witness mixed (tainted + clean) => not all-tainted, clean
    __assert_taint__(tm_e, false);
}

__test_taint__(__set_taint__("Hello"));
