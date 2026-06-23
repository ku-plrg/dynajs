// @type concolic
// @target es5 String.prototype.split
// @feature builtin regexp-split-capture-first

function __test_symbolic__(symbolic) {
  if (symbolic.length < 5) {
    symbolic = symbolic.split(/(a)/);
    // @witness __test_symbolic__("hia")
    __IS_SAT__(symbolic.length > 0 && symbolic[0] === "hi", true);
  }
}

__test_symbolic__(__symbolic__('s', ""));
