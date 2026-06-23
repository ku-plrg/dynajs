// @type taint
// @target es5 closure
// @feature syntax closure

function tcl_make(x) {
  return function () {
    return x;
  };
}

function __test_taint__(tainted) {
    var tcl_fn = tcl_make(tainted);
    __assert_taint__(tcl_fn(), true);
}

__test_taint__(__set_taint__("tv"));
