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
    // @witness `#f in o` is a boolean presence check, not the field value => clean
    __assert_taint__(c.hasF(c), false);
}

__test_taint__(__set_taint__("tv"));
