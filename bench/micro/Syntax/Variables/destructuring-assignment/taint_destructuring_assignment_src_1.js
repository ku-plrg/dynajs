// @type taint
// @target es6+ destructuring-assignment
// @feature syntax destructuring-assignment
// @done


function __test_taint__(tainted) {
    var tds_a, tds_b;
    [tds_a, tds_b] = [tainted, "clean"];
    // @witness __test_taint__("x") => tds_a = "x"
    __assert_taint__(tds_a, true);
}

__test_taint__(__set_taint__("tv"));
