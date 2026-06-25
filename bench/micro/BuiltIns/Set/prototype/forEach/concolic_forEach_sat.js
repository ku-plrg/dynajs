// @type concolic
// @target es6+ Set.prototype.forEach
// @feature builtin forEach

function __test_symbolic__(symbolic) {
  var s = new Set([1, 2]);
  s.add(symbolic);
  var sum = 0;
  s.forEach(function (v) { sum += v; });
  // @witness __test_symbolic__(7)
  __IS_SAT__(sum === 10, true);
}

__test_symbolic__(__symbolic__('s', 3));
