// @type taint
// @target es5 new-constructor
// @feature syntax new-constructor
// @done

function TNC_Const(v) {
  this.label = "clean";
}

function __test_taint__(tainted) {
    var tnc_c = new TNC_Const(tainted);
    // @witness tnc_c.label is always "clean"
    __assert_taint__(tnc_c.label, false);
}

__test_taint__(__set_taint__("tv"));
