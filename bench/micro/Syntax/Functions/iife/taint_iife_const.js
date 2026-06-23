// @type taint
// @target es5 iife
// @feature syntax iife

function __test_taint__(tainted) {
    var tii_cr = (function (a) {
      return "clean";
    })(tainted);
    __assert_taint__(tii_cr, false);
}

__test_taint__(__set_taint__("tv"));
