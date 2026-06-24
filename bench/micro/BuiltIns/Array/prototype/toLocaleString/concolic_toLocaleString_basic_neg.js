// @type concolic
// @target es5 Array.prototype.toLocaleString
// @feature builtin toLocaleString

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var s = symbolic.toLocaleString();
    // @witness __test_symbolic__([7, 0])
    __IS_SAT__(s.includes("7"), true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
