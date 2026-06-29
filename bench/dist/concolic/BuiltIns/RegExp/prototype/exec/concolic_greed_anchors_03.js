// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-greed-anchors

function __test_symbolic__(symbolic) {
  var b = /.../.exec(symbolic);
  if (b) {
    // @witness /.../ is three single-char atoms with no quantifier, so a successful match always spans exactly 3 chars and b[0].length is never anything but 3
    __IS_SAT__(b[0].length !== 3, false);
  }
}

__test_symbolic__(__symbolic__('s', "abc"));
