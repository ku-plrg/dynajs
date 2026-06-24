// @type taint
// @target es5 switch
// @feature syntax switch
// @done

function __test_taint__(tainted) {
    var ts_out;
    switch ("k") {
      case "k":
        ts_out = tainted;
        break;
      default:
        ts_out = "clean";
    }
    // @witness __test_taint__("x") => ts_out = "x"
    __assert_taint__(ts_out, true);
}

__test_taint__(__set_taint__("tv"));
