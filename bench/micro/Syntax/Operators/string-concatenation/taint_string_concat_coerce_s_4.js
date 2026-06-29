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
    // @witness r[5] = '[' coerced from clean object via toString() => char is clean
    __assert_taint__(tscc_lr[5], false);
}

__test_taint__(__set_taint__("Hello"));
