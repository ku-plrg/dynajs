// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-greed-nested

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/^((.)(.))?$/);
  if (b) {
    if (b[0] === "") {
      // @witness on the empty match the optional group never participates, so b[3] is always undefined (falsy)
      __IS_SAT__(b[3], false);
    } else {
    }
  }
}

__test_symbolic__(__symbolic__("s", ""));
