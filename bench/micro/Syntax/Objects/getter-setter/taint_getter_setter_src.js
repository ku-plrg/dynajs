// @type taint
// @target es5 getter-setter
// @feature syntax getter-setter
// @done

function __test_taint__(tainted) {
    var gs_obj = {
      get acc() {
        return tainted;
      },
    };
    // @witness __test_taint__('x') -> gs_obj.acc = 'x'
    __assert_taint__(gs_obj.acc, true);
}

__test_taint__(__set_taint__("tv"));
