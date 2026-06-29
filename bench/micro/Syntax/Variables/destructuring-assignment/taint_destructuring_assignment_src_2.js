// @type taint
// @target es6+ destructuring-assignment
// @feature syntax destructuring-assignment
// @done


function __test_taint__(tainted) {
    var tds_a, tds_b;
    [tds_a, tds_b] = [tainted, "clean"];
    // @witness always "clean"
    __assert_taint__(tds_b, false);
}

__test_taint__(__set_taint__("tv"));
