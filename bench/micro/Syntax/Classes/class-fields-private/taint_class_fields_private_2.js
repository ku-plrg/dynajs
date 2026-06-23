// @type taint
// @target es6+ class-fields-private
// @feature syntax class-fields-private
// Private instance fields (`#x`, ES2022); the `#x in obj` brand check lives in
// class-fields-private-in. Reading a private field returns its stored value/taint.

function __test_taint__(tainted) {
    class TPF {
      #secret = tainted;
      #label = "fixed";
      reveal() {
        return this.#secret;
      }
      getLabel() {
        return this.#label;
      }
    }
    var tpf = new TPF();
    __assert_taint__(tpf.reveal(), true);
    __assert_taint__(tpf.getLabel(), false);
}

__test_taint__(__set_taint__("tv"));
