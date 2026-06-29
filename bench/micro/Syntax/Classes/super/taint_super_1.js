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
    // @witness __test_taint__('x') => super(v) forwards tainted to Base => this.v tainted
    __assert_taint__(d.getV(), true);
}

__test_taint__(__set_taint__("tv"));
