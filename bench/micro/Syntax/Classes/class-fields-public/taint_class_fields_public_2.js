// @type taint
// @target es6+ class-fields-public
// @feature syntax class-fields-public
// @done

function __test_taint__(tainted) {
    class TCF {
      tainted = tainted;
      clean = "clean";
    }
    var tcf = new TCF();
    // @witness always "clean"
    __assert_taint__(tcf.clean, false);
}

__test_taint__(__set_taint__("tv"));
