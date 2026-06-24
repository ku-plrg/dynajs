// @type taint
// @target es5 do-while
// @feature syntax do-while
// @done

function __test_taint__(tainted) {
    var td_acc = "";
    var td_i = 0;
    do {
      td_acc = td_acc + tainted;
      td_i = td_i + 1;
    } while (td_i < 5);
    // @witness __test_taint__("x") => td_acc = "xxxxx"
    __assert_taint__(td_acc, true);
}

__test_taint__(__set_taint__("tv"));
