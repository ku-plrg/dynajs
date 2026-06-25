// @type concolic
// @target es6+ Object.entries
// @feature builtin entries

function __test_symbolic__(symbolic) {
  if (Object.entries(symbolic)[0][1] === 5) {
    // @witness the object's only entry is ["a", symbolic.a], so entry value 5 forces symbolic.a to 5
    __IS_SAT__(symbolic.a !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', { a: 5 }));
