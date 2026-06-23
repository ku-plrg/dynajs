// @type taint
// @target es5 var-declaration
// @feature syntax var-declaration

function __test_taint__(tainted) {
    function tvd_g() {
      var x = tainted;
      var x;
      return x;
    }
    __assert_taint__(tvd_g(), true);
}

__test_taint__(__set_taint__("tv"));
