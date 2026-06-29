// @type concolic
// @target es5 arithmetic
// @feature syntax arithmetic

function __test_symbolic__(symbolic) {
    if (symbolic > 10) {
      // @witness the symbolic > 10 guard forces symbolic + 3 > 13
      __IS_SAT__(symbolic + 3 <= 13, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 12));
