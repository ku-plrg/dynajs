// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-github-url

function __test_symbolic__(symbolic) {
  if (/^git(?:@|:\/\/)github\.com(?::|\/)([^\/]+\/[^\/]+)\.git$/.test(symbolic)) {
    // @witness the guard match is non-empty, so the length can never be exactly 0
    __IS_SAT__(symbolic.length === 0, false);
  }
}

__test_symbolic__(__symbolic__("s", "git://github.com/user/repo.git"));
