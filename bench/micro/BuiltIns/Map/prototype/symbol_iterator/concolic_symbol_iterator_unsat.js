// @type concolic
// @target es6+ Map.prototype[Symbol.iterator]
// @feature builtin symbol_iterator

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 5);
  if (m[Symbol.iterator]().next().value[0] === symbolic) {
    // @witness the default iterator yields [key, value]; the only entry's value is 5
    __IS_SAT__(m[Symbol.iterator]().next().value[1] !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
