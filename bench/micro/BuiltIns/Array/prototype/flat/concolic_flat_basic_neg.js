// @type concolic
// @target es2019 Array.prototype.flat
// @feature builtin flat

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.flat();
    // @witness __test_symbolic__([7, 0])
    __IS_SAT__(r[0] === 7, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
