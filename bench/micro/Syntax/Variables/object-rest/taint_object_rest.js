// @type taint
// @target es6+ object-rest
// @feature syntax object-rest
// An object rest pattern (`{a, ...rest}`, ES2018) collects the remaining
// own-enumerable properties into a new object, preserving each value's taint.

function __test_taint__(tainted) {
    var { a: tor_a, ...tor_rest } = { a: "clean", b: tainted, c: "x" };
    __assert_taint__(tor_a, false);
    __assert_taint__(tor_rest.b, true);
    __assert_taint__(tor_rest.c, false);
}

__test_taint__(__set_taint__("tv"));
