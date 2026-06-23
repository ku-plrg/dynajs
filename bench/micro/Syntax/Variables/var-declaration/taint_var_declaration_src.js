// @type taint
// @target es5 var-declaration
// @feature syntax var-declaration

function __test_taint__(tainted) {
    function tvd_f() {
      var local;
      local = tainted;
      return local;
    }
    __assert_taint__(tvd_f(), true);
}

__test_taint__(__set_taint__("tv"));
