// @type taint
// @target es6+ destructuring-assignment
// @feature syntax destructuring-assignment
// Destructuring as an ASSIGNMENT (no declaration keyword) targets existing
// bindings; each receives the taint of the element/property it is assigned.

// array assignment pattern -> each target takes its element's taint.

function __test_taint__(tainted) {
    var tds_x;
    ({ p: tds_x } = { p: tainted });
    __assert_taint__(tds_x, true);
}

__test_taint__(__set_taint__("tv"));
