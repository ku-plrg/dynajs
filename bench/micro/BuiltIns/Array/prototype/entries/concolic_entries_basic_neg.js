// @type concolic
// @target es6+ Array.prototype.entries
// @feature builtin entries

function __test_symbolic__(symbolic) {
  if (symbolic.length >= 1) {
    var first = symbolic.entries().next().value;
    // @witness __test_symbolic__([9])
    __IS_SAT__(first[1] === 9, true);
  }
}

__test_symbolic__(__symbolic__('s', [3]));
