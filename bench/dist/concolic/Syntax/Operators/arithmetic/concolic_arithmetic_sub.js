// @type concolic
// @target es5 arithmetic
// @feature syntax arithmetic

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
      // @witness __test_symbolic__(5)
      __IS_SAT__(symbolic - 1 !== 4, true);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
