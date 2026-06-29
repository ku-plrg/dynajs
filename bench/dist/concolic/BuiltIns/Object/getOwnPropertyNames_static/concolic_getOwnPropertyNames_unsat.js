// @type concolic
// @target es5 Object.getOwnPropertyNames
// @feature builtin getownpropertynames

function __test_symbolic__(symbolic) {
  if (Object.getOwnPropertyNames(symbolic).length === 1) {
    // @witness the object's own-property-name count is a single value, so it cannot be both 1 and 2
    __IS_SAT__(Object.getOwnPropertyNames(symbolic).length === 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', { a: 1 }));
