// @type taint
// @target es6+ class-fields-private
// @feature syntax class-fields-private
// @done

function __test_taint__(tainted) {
    class TPF {
      #secret = tainted;
      #label = "clean";
      reveal() {
        return this.#secret;
      }
      hasBrand(o) {
        return #secret in o;
      }
      getLabel() {
        return this.#label;
      }
    }
    var tpf = new TPF();
    // @witness __test_taint__("x")
    __assert_taint__(tpf.reveal(), true);
    // @witness always boolean clean value
    __assert_taint__(tpf.hasBrand(tpf), false);
    // @witness always "clean"
    __assert_taint__(tpf.getLabel(), false);
}

__test_taint__(__set_taint__("tv"));
