// @type taint
// @target es6+ destructuring-assignment
// @feature syntax destructuring-assignment
// @done


function __test_taint__(tainted) {
    var tds_x;
    ({ p: tds_x } = { p: tainted });
    // @witness __test_taint__("x") => tds_x = "x"
    __assert_taint__(tds_x, true);
}

__test_taint__(__set_taint__("tv"));
