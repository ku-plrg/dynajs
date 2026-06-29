// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-sticky

function __test_symbolic__(symbolic) {
  var re = /abc/y;
  if (symbolic.length < 4) {
    if (re.test(symbolic)) {
      // @witness the guard's sticky re.test already advanced lastIndex past the only match, so this second re.test resumes at end-of-match and can never be true
      __IS_SAT__(re.test(symbolic), false);
    }
  }
}

__test_symbolic__(__symbolic__('s', "abc"));
