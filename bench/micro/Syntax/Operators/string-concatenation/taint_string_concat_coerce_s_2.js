// @type taint
// @target es5 string-concatenation
// @feature syntax string-concatenation
// Coercion during `+`: a tainted string contributes tainted chars, but a
// tainted *object* coerces via toString() to a fresh string whose chars are
// clean (the taint is on the object, not on the produced characters).

// tainted string on the left, plain object on the right

function __test_taint__(tainted) {
    var tscc_obj = { a: "test" };
    var tscc_lr = tainted + tscc_obj;
    // @witness __test_taint__('x') => r[0] = 'x' tainted
    __assert_taint__(tscc_lr[0], true);
}

__test_taint__(__set_taint__("Hello"));
