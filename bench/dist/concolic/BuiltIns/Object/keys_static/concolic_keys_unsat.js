// @type concolic
// @target es5 Object.keys
// @feature builtin keys

function __test_symbolic__(symbolic) {
  if (Object.keys(symbolic).length === 1) {
    // @witness with exactly one own key, the key count cannot simultaneously be 0
    __IS_SAT__(Object.keys(symbolic).length === 0, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', { a: 1 }));
