// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-greed-optionals

function __test_symbolic__(symbolic) {
  var b = /^(a)+?$/.exec(symbolic);
  if (b) {
    // @witness __test_symbolic__("aaaaaaaaaaaaaaa")
    __IS_SAT__(b[0].length === 15, true);
  }
}

__test_symbolic__(__symbolic__('s', "aaaaaaaaaaaaaaa"));
