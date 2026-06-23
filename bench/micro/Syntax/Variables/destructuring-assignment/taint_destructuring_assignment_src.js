// @type taint
// @target es6+ destructuring-assignment
// @feature syntax destructuring-assignment
// Destructuring as an ASSIGNMENT (no declaration keyword) targets existing
// bindings; each receives the taint of the element/property it is assigned.

// array assignment pattern -> each target takes its element's taint.

function __test_taint__(tainted) {
    var tds_a, tds_b;
    [tds_a, tds_b] = [tainted, "clean"];
    __assert_taint__(tds_a, true);
    __assert_taint__(tds_b, false);
}

__test_taint__(__set_taint__("tv"));
