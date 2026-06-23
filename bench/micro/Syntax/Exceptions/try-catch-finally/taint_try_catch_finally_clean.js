// @type taint
// @target es6+ try-catch-finally
// @feature syntax try-catch-finally

function __test_taint__(tainted) {
    var te_clean;
    try {
      throw "clean";
    } catch (e2) {
      te_clean = e2;
    }
    __assert_taint__(te_clean, false);
}

__test_taint__(__set_taint__("x"));
