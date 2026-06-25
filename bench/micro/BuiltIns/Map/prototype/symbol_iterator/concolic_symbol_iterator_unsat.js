// @type concolic
// @target es6+ Map.prototype[Symbol.iterator]
// @feature builtin symbol_iterator

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 5);
  if (m.has(symbolic)) {
    var first = m[Symbol.iterator]().next().value;
    // @witness the default iterator yields [key, value]; the only entry's value is 5
    __IS_SAT__(first[1] !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
