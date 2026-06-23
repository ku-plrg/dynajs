// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-greed-anchors

function __test_symbolic__(symbolic) {
  var b = /.../.exec(symbolic);
  if (b) {
    // @witness __test_symbolic__("aaaaaaaaaa")
    __IS_SAT__(symbolic.length > 9, true);
  }
}

__test_symbolic__(__symbolic__('s', "aaaaaaaaaa"));
