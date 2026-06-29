// @type taint
// @target es5 iife
// @feature syntax iife
// @done

function __test_taint__(tainted) {
    var tii_r = (function (a) {
      return a;
    })(tainted);
    // @witness __test_taint__('x') => IIFE returns 'a' = 'x' tainted
    __assert_taint__(tii_r, true);
}

__test_taint__(__set_taint__("tv"));
