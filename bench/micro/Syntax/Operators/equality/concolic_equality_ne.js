// @type concolic
// @target es5 equality
// @feature syntax equality

function __test_symbolic__(symbolic) {
    if (symbolic !== 0) {
      // @witness __test_symbolic__(3)
      __IS_SAT__(symbolic !== 0, true);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 3));
