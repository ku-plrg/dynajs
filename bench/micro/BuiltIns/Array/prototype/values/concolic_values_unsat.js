// @type concolic
// @target es6+ Array.prototype.values
// @feature builtin values

function __test_symbolic__(symbolic) {
  if (symbolic[0] === 5) {
    var first = symbolic.values().next().value;
    // @witness values() yields elements in order, so the first is index 0, pinned to 5
    __IS_SAT__(first !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [5]));
