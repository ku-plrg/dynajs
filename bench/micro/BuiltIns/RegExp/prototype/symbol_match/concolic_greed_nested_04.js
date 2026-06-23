// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-greed-nested

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/^((.)(.))?$/);
  if (b) {
    if (b[0] === "") {
    } else {
      // @witness __test_symbolic__("aa")
      __IS_SAT__(b[3] === b[2], true);
    }
  }
}

__test_symbolic__(__symbolic__("s", "aa"));
