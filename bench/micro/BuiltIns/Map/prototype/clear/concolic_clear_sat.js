// @type concolic
// @target es6+ Map.prototype.clear
// @feature builtin clear
// @done 

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set("a", 1);
  m.clear();
  m.set(symbolic, 9);
  // @witness __test_symbolic__("x")
  __IS_SAT__(m.get("x") === 9, true);
}

__test_symbolic__(__symbolic__('s', "a"));
