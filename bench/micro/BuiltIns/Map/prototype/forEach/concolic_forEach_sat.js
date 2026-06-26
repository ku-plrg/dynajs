// @type concolic
// @target es6+ Map.prototype.forEach
// @feature builtin forEach
// @done

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set("a", 1);
  m.set("b", symbolic);
  var sum = 0;
  m.forEach(function (v) { sum += v; });
  // @witness __test_symbolic__(9)
  __IS_SAT__(sum === 10, true);
}

__test_symbolic__(__symbolic__('s', 2));
