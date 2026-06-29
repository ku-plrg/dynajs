// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-greed-anchors

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/.../);
  if (b) {
    // @witness __test_symbolic__("abcdefghij")
    __IS_SAT__(symbolic.length > 9, true);
  }
}

__test_symbolic__(__symbolic__('s', "ABCDEFGHIJ"));
