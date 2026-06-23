// @type concolic
// @target es6+ RegExp.prototype.exec
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  var re2 = /^a(?=(a))a$/;
  if (re2.test(symbolic)) {
    var caps = re2.exec(symbolic);
    // @witness the only string matching /^a(?=(a))a$/ is "aa", whose lookahead group always captures exactly "a"
    __IS_SAT__(caps[1] !== "a", false);
  }
}

__test_symbolic__(__symbolic__("x", "aa"));
