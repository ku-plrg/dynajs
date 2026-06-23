// @type taint
// @target es5 getter-setter
// @feature syntax getter-setter

function __test_taint__(tainted) {
    var gs_obj = {
      get acc() {
        return tainted;
      },
    };
    __assert_taint__(gs_obj.acc, true);
}

__test_taint__(__set_taint__("tv"));
