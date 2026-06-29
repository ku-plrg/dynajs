// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-greed-optionals

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/^(a)+?$/);
  if (b) {
    // @witness __test_symbolic__("aaaaaaaaaaaaaaa")
    __IS_SAT__(b[0].length === 15, true);
  }
}

__test_symbolic__(__symbolic__('s', "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"));
