// @type concolic
// @target es6+ Map.prototype.entries
// @feature builtin entries

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 5);
  if (m.has(symbolic)) {
    var first = m.entries().next().value;
    // @witness the only entry maps symbolic -> 5, so the entry value cannot differ from 5
    __IS_SAT__(first[1] !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
