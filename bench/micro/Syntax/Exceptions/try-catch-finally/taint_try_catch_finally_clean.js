// @type taint
// @target es6+ try-catch-finally
// @feature syntax try-catch-finally
// @done

function __test_taint__(tainted) {
    var te_clean;
    try {
      tainted;
      throw "clean";
    } catch (e2) {
      te_clean = e2;
    }
    // @witness always "clean"
    __assert_taint__(te_clean, false);
}

__test_taint__(__set_taint__("x"));
