// @type taint
// @target es5 getter-setter
// @feature syntax getter-setter

function __test_taint__(tainted) {
    var gs_store = {
      _v: "",
      set val(x) {
        this._v = x;
      },
      get val() {
        return this._v;
      },
    };
    gs_store.val = tainted;
    __assert_taint__(gs_store.val, true);
}

__test_taint__(__set_taint__("tv"));
