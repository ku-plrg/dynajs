// @type concolic
// @target es6+ Array.prototype.keys
// @feature builtin keys
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.keys().next().value === 0) {
    // @witness symbolic must have at least one element for keys() to return 0 as the first key
    __IS_SAT__(symbolic.length < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [7]));
