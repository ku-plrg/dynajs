// @type taint
// @target es5 iife
// @feature syntax iife
// @done

function __test_taint__(tainted) {
    var tii_cr = (function (a) {
      return "clean";
    })(tainted);
    // @witness tainted arg ignored, IIFE returns literal "clean" => clean
    __assert_taint__(tii_cr, false);
}

__test_taint__(__set_taint__("tv"));
