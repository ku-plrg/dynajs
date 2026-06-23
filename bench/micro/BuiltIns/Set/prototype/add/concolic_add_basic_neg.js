// @type concolic
// @target es6+ Set.prototype.add
// @feature builtin add

function __test_symbolic__(symbolic) {

  var s = new Set([10]);
  s.add(symbolic);
  // adding a value equal (SameValueZero) to the existing 10 keeps size at 1;
  // any other value grows it to 2, so size === 1 is reachable
  if (s.size <= 2) {
    // @witness __test_symbolic__(10)
    __IS_SAT__(s.size === 1, true);
  }

}

__test_symbolic__(__symbolic__('s', 11));
