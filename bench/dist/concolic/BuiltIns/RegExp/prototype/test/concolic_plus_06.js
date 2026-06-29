// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^he+l+l+o_wor+l+d+$/.test(symbolic)) {
    // @witness the pattern is one "o" then "_", so "hellooooo_world" with extra o's before "_" never matches the guard
    __IS_SAT__(symbolic === "hellooooo_world", false);
  }

  if (/^z+$/.test(symbolic)) {
    if (symbolic.length < 5) {
      for (var i = 0; i < symbolic.length; i++) {
      }
    }
  }
}

__test_symbolic__(__symbolic__('s', "hello_world"));
