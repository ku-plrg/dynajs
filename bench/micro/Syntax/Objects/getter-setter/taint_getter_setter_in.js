// @type taint
// @target es5 getter-setter
// @feature syntax getter-setter
// @done

function __test_taint__(tainted) {
    var gs_store = {
      _v: "",
      set val(x) {
        this._v = "clean";
      },
      get val() {
        return this._v;
      },
    };
    gs_store.val = tainted;
    // @witness gs_store.val is always "clean"
    __assert_taint__(gs_store.val, false);
}

__test_taint__(__set_taint__("tv"));
