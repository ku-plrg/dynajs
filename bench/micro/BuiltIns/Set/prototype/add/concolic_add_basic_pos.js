// @type concolic
// @target es6+ Set.prototype.add
// @feature builtin add

function __test_symbolic__(symbolic) {

  var s = new Set();
  s.add(symbolic);
  // one add into an empty set always yields size exactly 1, for any value
  // (SameValueZero collapses nothing here; there is no prior element)
  if (s.size >= 1) {
    // @witness add into empty set forces size===1, so size!==1 cannot hold here
    __IS_SAT__(s.size !== 1, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', 5));
