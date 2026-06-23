// @type taint
// @target es6+ class-fields-public
// @feature syntax class-fields-public

function __test_taint__(tainted) {
    class TCF {
      tainted = tainted;
      clean = "fixed";
    }
    var tcf = new TCF();
    __assert_taint__(tcf.tainted, true);
    __assert_taint__(tcf.clean, false);
}

__test_taint__(__set_taint__("tv"));
