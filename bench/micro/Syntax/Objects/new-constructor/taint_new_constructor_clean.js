// @type taint
// @target es5 new-constructor
// @feature syntax new-constructor

function TNC_Const(v) {
  this.label = "fixed";
}

function __test_taint__(tainted) {
    var tnc_c = new TNC_Const(tainted);
    __assert_taint__(tnc_c.label, false);
}

__test_taint__(__set_taint__("tv"));
