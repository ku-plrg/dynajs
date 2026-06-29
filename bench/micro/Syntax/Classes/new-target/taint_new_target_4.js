// @type taint
// @target es6+ new-target
// @feature syntax new-target
// @done

function TNT(v) {
  this.kind = new.target ? v : "clean";
  this.v = v;
}

function __test_taint__(tainted) {
    var tnt = new TNT(tainted);
    tnt = {};
    TNT.call(tnt, tainted);   // plain call (no `new`) -> new.target is undefined
    // @witness __test_taint__("x")
    __assert_taint__(tnt.v, true);
}

__test_taint__(__set_taint__("tv"));
