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
    // @witness __test_taint__('x') -> tvd_f() = 'x'
    __assert_taint__(tvd_f(), true);
    function tvd_g() {
      var x = tainted;
      var x;
      return x;
    }
    // @witness __test_taint__('x') -> tvd_g() = 'x'
    __assert_taint__(tvd_g(), true);
    var tvd_clean = "clean";
    // @witness tvd_clean is always "clean"
    __assert_taint__(tvd_clean, false);

}

__test_taint__(__set_taint__("tv"));
