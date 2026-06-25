// @type concolic
// @target es5 Object.prototype.propertyIsEnumerable
// @feature builtin propertyisenumerable

function __test_symbolic__(symbolic) {
  var o = { a: 1 };
  if (o.propertyIsEnumerable(symbolic)) {
    // @witness an enumerable own property must exist, so o[symbolic] is its value (1), never undefined
    __IS_SAT__(o[symbolic] === undefined, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
