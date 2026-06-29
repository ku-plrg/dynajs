// @type taint
// @target es5 closure
// @feature syntax closure
// @done

function tcl_make(x) {
  return function () {
    return x;
  };
}

function __test_taint__(tainted) {
    var tcl_fn = tcl_make(tainted);
    // @witness __test_taint__('x') => captured value = 'x' tainted
    __assert_taint__(tcl_fn(), true);
}

__test_taint__(__set_taint__("tv"));
