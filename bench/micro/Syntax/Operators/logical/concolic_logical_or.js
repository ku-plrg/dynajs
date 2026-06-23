// @type concolic
// @target es5 logical
// @feature syntax logical

function __test_symbolic__(symbolic) {
    if (symbolic < 0 || symbolic > 1) {
      // @witness the symbolic < 0 || symbolic > 1 guard forces symbolic !== 1
      __IS_SAT__(symbolic === 1, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 2));
