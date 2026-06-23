// @type taint
// @target es5 getter-setter
// @feature syntax getter-setter

function __test_taint__(tainted) {
    var gs_const = {
      get acc() {
        return "fixed";
      },
    };
    __assert_taint__(gs_const.acc, false);
}

__test_taint__(__set_taint__("x"));
