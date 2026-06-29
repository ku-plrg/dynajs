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
    // @witness __test_taint__('x') => toc_r = 'x' tainted (catch body assigns tainted)
    __assert_taint__(toc_r, true);
}

__test_taint__(__set_taint__("tv"));
