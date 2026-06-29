// @type concolic
// @target es6+ numeric-separator
// @feature syntax numeric-separator

function __test_symbolic__(symbolic) {
    if (symbolic === 1_000_000) {
      // @witness the symbolic === 1_000_000 guard forces symbolic > 999_999
      __IS_SAT__(symbolic <= 999_999, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 1000000));
