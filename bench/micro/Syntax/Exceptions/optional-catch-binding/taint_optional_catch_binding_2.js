// @type taint
// @target es6+ optional-catch-binding
// @feature syntax optional-catch-binding
// @done

function __test_taint__(tainted) {
    var toc_r;
    try {
      throw 0;
    } catch {
      toc_r = tainted;
    }
    var toc_clean = "clean";
    try {
      toc_clean = toc_clean + "";
    } catch {
      toc_clean = tainted;
    }
    // @witness no exception thrown => catch skipped, toc_clean stays clean literal
    __assert_taint__(toc_clean, false);
}

__test_taint__(__set_taint__("tv"));
