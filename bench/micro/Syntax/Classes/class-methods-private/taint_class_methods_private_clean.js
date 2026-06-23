// @type taint
// @target es6+ class-methods-private
// @feature syntax class-methods-private
// Private instance methods (`#m(){}`, ES2022) are callable only from inside the
// class; a private method returning a tainted field yields tainted data. A
// parser without private-method support reports `error` here; ground truth is
// the true semantics.

function __test_taint__(tainted) {
    class TPM2 {
      #label() {
        return "fixed";
      }
      reveal() {
        return this.#label();
      }
    }
    __assert_taint__(new TPM2().reveal(), false);
}

__test_taint__(__set_taint__("x"));
