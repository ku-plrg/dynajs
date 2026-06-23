// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-greed-optionals

function __test_symbolic__(symbolic) {
  var b = /^(a)+?$/.exec(symbolic);
  if (b) {
    // @witness capture group (a) holds only the last single "a", so b[1].length is always 1, never 15
    __IS_SAT__(b[1].length === 15, false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
