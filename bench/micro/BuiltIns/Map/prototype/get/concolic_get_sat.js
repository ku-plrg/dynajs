// @type concolic
// @target es6+ Map.prototype.get
// @feature builtin get
// @done

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set("a", 1);
  // @witness __test_symbolic__("a")
  __IS_SAT__(m.get(symbolic) === 1, true);
}

__test_symbolic__(__symbolic__('s', "z"));
