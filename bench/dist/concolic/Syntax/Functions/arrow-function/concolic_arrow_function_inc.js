// @type concolic
// @target es6+ arrow-function
// @feature syntax arrow-function

function __test_symbolic__(symbolic) {
    var inc = (n) => n + 1;
    if (symbolic > 0) {
      // @witness the symbolic > 0 guard forces inc(symbolic) > 1
      __IS_SAT__(inc(symbolic) <= 1, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
