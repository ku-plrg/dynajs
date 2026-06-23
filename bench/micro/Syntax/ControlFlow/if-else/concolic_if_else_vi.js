// @type concolic
// @target es5 if-else
// @feature syntax if-else

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
      // @witness __test_symbolic__(7)
      __IS_SAT__(symbolic !== 2, true);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 7));
