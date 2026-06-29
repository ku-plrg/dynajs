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
    // @witness always "clean"
    __assert_taint__(tpf.getLabel(), false);
}

__test_taint__(__set_taint__("tv"));
