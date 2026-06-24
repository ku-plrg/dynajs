// @type taint
// @target es5 break-continue
// @feature syntax break-continue
// @done

function __test_taint__(tainted) {
    var tb_arr = ["a", tainted, "c"];
    var tb_picked;
    for (var tb_i = 0; tb_i < tb_arr.length; tb_i++) {
      if (tb_i === 1) {
        tb_picked = tb_arr[tb_i];
        break;
      }
    }
    // @witness __test_taint__("x")
    __assert_taint__(tb_picked, true);
}

__test_taint__(__set_taint__("tv"));
