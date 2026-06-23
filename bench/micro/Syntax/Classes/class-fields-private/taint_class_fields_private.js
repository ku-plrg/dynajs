// @type taint
// @target es6+ class-fields-private
// @feature syntax class-fields-private

function __test_taint__(tainted) {
    class TPF {
      #secret = tainted;
      reveal() {
        return this.#secret;
      }
      hasBrand(o) {
        return #secret in o;
      }
    }
    var tpf = new TPF();
    __assert_taint__(tpf.reveal(), true);
    __assert_taint__(tpf.hasBrand(tpf), false);
}

__test_taint__(__set_taint__("tv"));
