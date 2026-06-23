// @type taint
// @target es6+ new-target
// @feature syntax new-target

function TNT(v) {
  this.kind = new.target ? "ctor" : "call";
  this.v = v;
}

function __test_taint__(tainted) {
    var tnt = new TNT(tainted);
    __assert_taint__(tnt.kind, false);
    __assert_taint__(tnt.v, true);
}

__test_taint__(__set_taint__("tv"));
