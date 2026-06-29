// @type concolic
// @target es5 String.prototype.split
// @feature builtin regexp-split-simple

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var k = symbolic.split(/e/);
    // @witness __test_symbolic__("je")
    __IS_SAT__(k[0] === "j", true);
  }
}

__test_symbolic__(__symbolic__("s", "JE"));
