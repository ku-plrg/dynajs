// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  var re = /^(?=([0-9])).$/;
  var re2 = /^[0-9]$/;
  if (re.test(symbolic)) {
    // @witness the guard's lookahead pins the single char to a digit, so re2 must also match
    __IS_SAT__(!(re2.test(symbolic)), false);
  }
}

__test_symbolic__(__symbolic__('s', "5"));
