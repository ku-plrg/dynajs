// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-anchors

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/(a)(b)(c)/);
  if (b) {
    // @witness b[0] is the unanchored match "abc", never the full "helloabc"
    __IS_SAT__(b[0] === "helloabc", false);
  }
}

__test_symbolic__(__symbolic__("s", "abc"));
