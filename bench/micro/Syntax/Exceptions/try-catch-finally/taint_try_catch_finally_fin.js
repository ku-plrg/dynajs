// @type taint
// @target es6+ try-catch-finally
// @feature syntax try-catch-finally

function __test_taint__(tainted) {
    var te_out;
    try {
      throw tainted;
    } catch (e3) {
      te_out = e3;
    } finally {
      te_out = te_out + "";
    }
    __assert_taint__(te_out, true);
}

__test_taint__(__set_taint__("tv"));
