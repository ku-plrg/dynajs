// @type taint
// @target es5 for-loop
// @feature syntax for-loop
// @done

function __test_taint__(tainted) {
    var tf_acc = "";
    for (var tf_i = 0; tf_i < 3; tf_i++) {
      tf_acc = tf_acc + tainted;
    }
    // @witness __test_taint__("x") => tf_acc = "xxx"
    __assert_taint__(tf_acc, true);
}

__test_taint__(__set_taint__("tv"));
