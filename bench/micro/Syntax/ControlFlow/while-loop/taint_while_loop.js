// @type taint
// @target es5 while-loop
// @feature syntax while-loop
// @done

function __test_taint__(tainted) {
    var tw_acc = "";
    var tw_i = 0;
    while (tw_i < 2) {
      tw_acc = tw_acc + tainted;
      tw_i = tw_i + 1;
    }
    // @witness __test_taint__("x") => tw_acc = "xx"
    __assert_taint__(tw_acc, true);
}

__test_taint__(__set_taint__("tv"));
