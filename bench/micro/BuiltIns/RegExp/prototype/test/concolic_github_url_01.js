// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-github-url

function __test_symbolic__(symbolic) {
  if (/^git(?:@|:\/\/)github\.com(?::|\/)([^\/]+\/[^\/]+)\.git$/.test(symbolic)) {
    // @witness the guard match consumes the literal "git" prefix and more, so the length can never be <= 0
    __IS_SAT__(symbolic.length <= 0, false);
  }
}

__test_symbolic__(__symbolic__("s", "git://github.com/user/repo.git"));
