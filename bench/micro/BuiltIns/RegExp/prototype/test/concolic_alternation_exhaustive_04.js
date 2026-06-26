// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-alternation

function __test_symbolic__(symbolic) {
  if (/^(a|b|hello|dog)$/.test(symbolic)) {
    // @witness __test_symbolic__("dog")
    __IS_SAT__(symbolic === "dog", true);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
