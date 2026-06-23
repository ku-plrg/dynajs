// @type taint
// @target es6+ class-fields-private-in
// @feature syntax class-fields-private-in
// The ergonomic brand check `#x in obj` (ES2022) tests whether an object has a
// private field; its boolean result is structural, NOT the tainted value. A
// parser without private-field support reports `error` here; ground truth is the
// true semantics.

function __test_taint__(tainted) {
    class TPI {
      #x = tainted;
      static has(o) {
        return #x in o;
      }
      read() {
        return this.#x;
      }
    }
    var tpi = new TPI();
    __assert_taint__(tpi.read(), true);
    __assert_taint__(TPI.has(tpi), false);
}

__test_taint__(__set_taint__("tv"));
