// @type taint
// @target es6+ class-methods-private
// @feature syntax class-methods-private
// @done

function __test_taint__(tainted) {
    class TPM {
      #v = tainted;
      #get() {
        return this.#v;
      }
      #label() {
        return "clean";
      }
      reveal() {
        return this.#get();
      }
      getLabel() {
        return this.#label();
      }
    }
    // @witness always "clean"
    __assert_taint__(new TPM().getLabel(), false);
}

__test_taint__(__set_taint__("tv"));
