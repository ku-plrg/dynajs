// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-greed-related

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/^(.+)(.+)$/);
  if (b) {
    // @witness __test_symbolic__("aa")
    __IS_SAT__(b[1] === b[2], true);
  }
}

__test_symbolic__(__symbolic__("s", "aa"));
