// @type concolic
// @target es5 if-else
// @feature syntax if-else

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
      __IS_SAT__(true, false);
    } else {
      // @witness the symbolic > 0 guard forces symbolic <= 0
      __IS_SAT__(symbolic > 0, false);
    }
}

__test_symbolic__(__symbolic__('s', -4));
