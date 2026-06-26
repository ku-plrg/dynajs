// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-greed-quantifiers

function __test_symbolic__(symbolic) {
  var b = /^(hello)+(.+)$/.exec(symbolic);
  if (b) {
    // @witness __test_symbolic__("helloXXXXXXX")
    __IS_SAT__(b[1].length < b[2].length, true);
  }
}

__test_symbolic__(__symbolic__('s', "helloxxxxxxx"));
