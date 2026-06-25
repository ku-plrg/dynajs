// @type concolic
// @target es6+ Set.prototype.entries
// @feature builtin entries

function __test_symbolic__(symbolic) {
  var s = new Set([symbolic]);
  if (s.has(symbolic)) {
    var first = s.entries().next().value;
    // @witness Set entries pair each value with itself, so entry[0] !== entry[1] is impossible
    __IS_SAT__(first[0] !== first[1], false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
