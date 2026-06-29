// @type taint
// @target es5 var-declaration
// @feature syntax var-declaration
// @done

function __test_taint__(tainted) {
    function tvd_f() {
      var local;
      local = tainted;
      return local;
    }
    function tvd_g() {
      var x = tainted;
      var x;
      return x;
    }
    // @witness __test_taint__('x') -> tvd_g() = 'x'
    __assert_taint__(tvd_g(), true);
}

__test_taint__(__set_taint__("tv"));
