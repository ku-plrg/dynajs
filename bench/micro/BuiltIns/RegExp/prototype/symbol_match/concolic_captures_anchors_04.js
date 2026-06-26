// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-anchors

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/(a)(b)(c)/);
  if (b) {
    // @witness __test_symbolic__("helloabc")
    __IS_SAT__(symbolic === "helloabc", true);
  }
}

__test_symbolic__(__symbolic__("s", "helloabchelloabc"));
