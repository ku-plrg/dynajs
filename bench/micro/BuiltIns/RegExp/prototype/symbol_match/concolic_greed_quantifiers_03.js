// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-greed-quantifiers

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/^(hello)+(.+)$/);
  if (b) {
    // @witness __test_symbolic__("hellohello")
    __IS_SAT__(b[2] === "hello", true);
  }
}

__test_symbolic__(__symbolic__("s", "hellohello"));
