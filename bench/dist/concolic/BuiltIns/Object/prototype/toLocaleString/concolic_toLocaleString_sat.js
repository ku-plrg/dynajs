// @type concolic
// @target es5 Object.prototype.toLocaleString
// @feature builtin tolocalestring

function __test_symbolic__(symbolic) {
  var s = ({}).toLocaleString();
  // @witness __test_symbolic__(15)
  __IS_SAT__(s.length === symbolic, true);
}

__test_symbolic__(__symbolic__('s', 3));
