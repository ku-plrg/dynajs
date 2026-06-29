// @type taint
// @target es5 typeof
// @feature syntax typeof

function __test_taint__(tainted) {
    // @witness typeof yields a fixed type string ("string"), not the operand value => clean
    __assert_taint__(typeof tainted, false);
}

__test_taint__(__set_taint__("tv"));
