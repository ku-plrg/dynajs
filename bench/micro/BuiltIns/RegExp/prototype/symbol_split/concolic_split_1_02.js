// @type concolic
// @target es5 String.prototype.split
// @feature builtin regexp-split-length-bound

function __test_symbolic__(symbolic) {
  if (symbolic.length < 5) {
    symbolic = symbolic.split(/a/);
    if (symbolic.length === 2) {
      // @witness __test_symbolic__("awh")
      __IS_SAT__(symbolic[1] === "wh", true);
    }
  }
}

__test_symbolic__(__symbolic__("s", "awh"));
