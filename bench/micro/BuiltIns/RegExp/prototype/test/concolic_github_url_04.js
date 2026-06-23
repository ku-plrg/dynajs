// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-github-url

function __test_symbolic__(symbolic) {
  if (/^git(?:@|:\/\/)github\.com(?::|\/)([^\/]+\/[^\/]+)\.git$/.test(symbolic)) {
    // @witness __test_symbolic__("git://github.com/user/repo.git")
    __IS_SAT__(symbolic.indexOf("@") === -1, true);
  }
}

__test_symbolic__(__symbolic__("s", "git://github.com/user/repo.git"));
