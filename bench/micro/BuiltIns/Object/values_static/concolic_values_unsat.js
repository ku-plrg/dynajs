// @type concolic
// @target es6+ Object.values
// @feature builtin values

function __test_symbolic__(symbolic) {
  if (Object.values(symbolic)[0] === 5) {
    // @witness the object's only value is symbolic.a, so values[0] === 5 forces symbolic.a to 5
    __IS_SAT__(symbolic.a !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', { a: 5 }));
