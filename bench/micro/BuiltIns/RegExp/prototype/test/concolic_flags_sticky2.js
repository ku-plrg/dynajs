// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-sticky-relock

function __test_symbolic__(symbolic) {
  var re = /Hello/y;
  if (symbolic.length < 13) {
    if (re.test(symbolic)) {
      // @witness __test_symbolic__("HelloHello")
      __IS_SAT__(re.test(symbolic), true);
    }
  }
}

__test_symbolic__(__symbolic__('s', "HelloHello"));
