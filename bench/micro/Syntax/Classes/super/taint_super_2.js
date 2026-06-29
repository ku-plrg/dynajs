// @type taint
// @target es6+ super
// @feature syntax super

function __test_taint__(tainted) {
    class Base {
      constructor(v) { this.v = v; }
      getV() { return this.v; }
    }
    class Derived extends Base {
      constructor(v) { super(v); }
      readSuper() { return super.getV(); }
    }
    var d = new Derived(tainted);
    // @witness super.getV() returns the tainted field through the parent method
    __assert_taint__(d.readSuper(), true);
}

__test_taint__(__set_taint__("tv"));
