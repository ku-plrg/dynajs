// @type concolic
// @target es5 logical
// @feature syntax logical

function __test_symbolic__(symbolic) {
    if (symbolic > 0 || symbolic < -10) {
      // @witness __test_symbolic__(7)
      __IS_SAT__(symbolic !== 7, true);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 7));
