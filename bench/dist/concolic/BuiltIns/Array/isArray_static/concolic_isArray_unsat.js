// @type concolic
// @target es5 Array.isArray
// @feature builtin isArray

function __test_symbolic__(symbolic) {
  if (Array.isArray(symbolic)) {
    // @witness symbolic is an array, so isArray is invariably true and its negation cannot hold
    __IS_SAT__(!Array.isArray(symbolic), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [5]));
