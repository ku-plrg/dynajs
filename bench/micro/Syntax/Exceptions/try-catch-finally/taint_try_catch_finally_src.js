// @type taint
// @target es6+ try-catch-finally
// @feature syntax try-catch-finally
// @done

function __test_taint__(tainted) {
    var te_r;
    try {
      throw tainted;
    } catch (e) {
      te_r = e;
    } finally {
    }
    // @witness __test_taint__("x") => te_r = "x"
    __assert_taint__(te_r, true);
}

__test_taint__(__set_taint__("tv"));
