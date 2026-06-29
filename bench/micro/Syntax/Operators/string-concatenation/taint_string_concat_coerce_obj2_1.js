// @type taint
// @target es5 string-concatenation
// @feature syntax string-concatenation
// Coercion during `+`: a tainted string contributes tainted chars, but a
// tainted *object* coerces via toString() to a fresh string whose chars are
// clean (the taint is on the object, not on the produced characters).

// tainted string on the left, plain object on the right

function __test_taint__(tainted) {
    var tscc_s2 = "Hello";
    var tscc_rr = tscc_s2 + tainted;
    // @witness tainted object coerces via toString() => all chars are clean; left side is clean literal too
    __assert_taint__(tscc_rr, false);
}

__test_taint__(__set_taint__({ a: "test" }));
