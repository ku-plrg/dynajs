// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-github-url

function __test_symbolic__(symbolic) {
  if (/^git(?:@|:\/\/)github\.com(?::|\/)([^\/]+\/[^\/]+)\.git$/.test(symbolic)) {
    // @witness the regex pins the prefix to the literal "git", so it is always present and indexOf can never be -1
    __IS_SAT__(symbolic.indexOf("git") === -1, false);
  }
}

__test_symbolic__(__symbolic__("s", "git://github.com/user/repo.git"));
