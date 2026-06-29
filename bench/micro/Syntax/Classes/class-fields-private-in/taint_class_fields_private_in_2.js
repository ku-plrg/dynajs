// @type taint
// @target es6+ class-fields-private-in
// @feature syntax class-fields-private-in

function __test_taint__(tainted) {
    class C {
      #f;
      constructor(v) { this.#f = v; }
      hasF(o) { return #f in o; }
      getF() { return this.#f; }
    }
    var c = new C(tainted);
    // @witness __test_taint__('x') => the private field still holds the tainted value
    __assert_taint__(c.getF(), true);
}

__test_taint__(__set_taint__("tv"));
