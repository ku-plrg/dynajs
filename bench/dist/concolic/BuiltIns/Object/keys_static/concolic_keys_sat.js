// @type concolic
// @target es5 Object.keys
// @feature builtin keys

function __test_symbolic__(symbolic) {
  // @witness __test_symbolic__({ a: 1, b: 2 })
  __IS_SAT__(Object.keys(symbolic).length === 2, true);
}

__test_symbolic__(__symbolic__('s', { a: 1 }));
