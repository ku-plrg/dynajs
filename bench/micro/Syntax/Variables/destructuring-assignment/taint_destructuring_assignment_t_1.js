// @type taint
// @target es6+ destructuring-assignment
// @feature syntax destructuring-assignment
// @done

function __test_taint__(tainted) {
    var tds_m = tainted,
      tds_n = "clean";
    [tds_m, tds_n] = [tds_n, tds_m];
    // @witness __test_taint__("x") => tds_n = "x"
    __assert_taint__(tds_n, true);
}

__test_taint__(__set_taint__("tv"));
