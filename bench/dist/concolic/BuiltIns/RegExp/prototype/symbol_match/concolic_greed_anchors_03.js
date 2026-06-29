// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-greed-anchors

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/.../);
  if (b) {
    // @witness unanchored /.../ with no g flag captures exactly 3 chars, so b[0].length is always 3
    __IS_SAT__(b[0].length !== 3, false);
  }
}

__test_symbolic__(__symbolic__('s', "abc"));
