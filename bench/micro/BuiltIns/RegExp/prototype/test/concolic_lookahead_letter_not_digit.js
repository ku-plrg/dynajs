// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  var re = /^(?=([a-z])).$/;
  var re2 = /^[0-9]$/;
  if (re.test(symbolic)) {
    // @witness the guard pins the single char to a lowercase letter, which can never also be a digit
    __IS_SAT__(re2.test(symbolic), false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
