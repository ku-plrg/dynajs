// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-greed-quantifiers

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/^(hello)+(.+)$/);
  if (b) {
    // @witness __test_symbolic__("helloABCDEF")
    __IS_SAT__(b[1].length < b[2].length, true);
  }
}

__test_symbolic__(__symbolic__("s", "helloabcdef"));
