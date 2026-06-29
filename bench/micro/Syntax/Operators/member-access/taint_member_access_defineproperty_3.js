// @type taint
// @target es5 member-access
// @feature syntax prop-map

function __test_taint__(tainted) {
    // one tainted prop among others => container mixed => clean
    var tm_a = {b: tainted, c: "World"};
    // @witness mixed (tainted + clean) => not all-tainted, clean
    __assert_taint__(tm_a, false);
}

__test_taint__(__set_taint__("Hello"));
