// @type concolic
// @target es5 Array.prototype.toLocaleString
// @feature builtin toLocaleString
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.toLocaleString().length >= 1) {
    // @witness a non-empty toLocaleString output means the array holds at least one element
    __IS_SAT__(symbolic.length < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
