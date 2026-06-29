// @type taint
// @target es5 member-access
// @feature syntax prop-map

function __test_taint__(tainted) {
    // one tainted prop among others => container mixed => clean
    var tm_a = {b: tainted, c: "World"};
    // @witness clean literal prop, clean
    __assert_taint__(tm_a.c, false);
}

__test_taint__(__set_taint__("Hello"));
