// @type concolic
// @target es6+ RegExp.prototype.exec
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  var re = /^(?=(..))[a-z]+$/;
  var r = re.exec(symbolic);
  // @witness __test_symbolic__("ab")
  __IS_SAT__(r, true);
}

__test_symbolic__(__symbolic__('s', ""));
