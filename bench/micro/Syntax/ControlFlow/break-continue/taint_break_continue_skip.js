// @type taint
// @target es5 break-continue
// @feature syntax break-continue
// @done

function __test_taint__(tainted) {
    var tb_sarr = [tainted, "clean"];
    var tb_kept;
    for (var tb_j = 0; tb_j < tb_sarr.length; tb_j++) {
      if (tb_j === 0) {
        continue;
      }
      tb_kept = tb_sarr[tb_j];
    }
    // @witness always "clean"
    __assert_taint__(tb_kept, false);
}

__test_taint__(__set_taint__("tv"));
