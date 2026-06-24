// @type taint
// @target es5 switch
// @feature syntax switch
// @done

function __test_taint__(tainted) {
    var ts_def_out;
    switch ("miss") {
      case "k":
        ts_def_out = tainted;
        break;
      default:
        ts_def_out = "clean";
    }
    // @witness always "clean"
    __assert_taint__(ts_def_out, false);
}

__test_taint__(__set_taint__("tv"));
