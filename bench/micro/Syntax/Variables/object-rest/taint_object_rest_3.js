// @type taint
// @target es6+ object-rest
// @feature syntax object-rest
// @done

function __test_taint__(tainted) {
    var { a: tor_a, ...tor_rest } = { a: "a", b: tainted, c: "c" };
    // @witness tor_rest.c is always "c"
    __assert_taint__(tor_rest.c, false);
}

__test_taint__(__set_taint__("tv"));
