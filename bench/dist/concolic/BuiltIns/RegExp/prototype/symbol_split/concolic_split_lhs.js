// @type concolic
// @target es5 String.prototype.split
// @feature builtin regexp-split-piece-value

function __test_symbolic__(symbolic) {
  if (symbolic.length === 3) {
    var y = symbolic.split(/a/);
    if (y.length === 2) {
      // @witness __test_symbolic__("hab")
      __IS_SAT__(symbolic.split(/a/)[0] === "h", true);
    }
  }
}

__test_symbolic__(__symbolic__("s", "bah"));
