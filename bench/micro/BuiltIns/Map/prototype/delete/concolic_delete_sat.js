// @type concolic
// @target es6+ Map.prototype.delete
// @feature builtin delete

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set("a", 1);
  m.set("b", 2);
  // @witness __test_symbolic__("a")
  __IS_SAT__(m.delete(symbolic), true);
}

__test_symbolic__(__symbolic__('s', "z"));
