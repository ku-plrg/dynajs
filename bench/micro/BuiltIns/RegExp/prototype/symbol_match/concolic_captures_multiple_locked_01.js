// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-multiple-locked

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/(abc)(d)/);
  if (b) {
    // @witness a successful match of /(abc)(d)/ pins the full match b[0] to exactly "abcd"
    __IS_SAT__(b[0] !== "abcd", false);
  }
}

__test_symbolic__(__symbolic__('s', "abcd"));
