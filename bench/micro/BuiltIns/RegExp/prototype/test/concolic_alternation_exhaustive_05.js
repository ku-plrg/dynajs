// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-alternation

function __test_symbolic__(symbolic) {
  if (/^(a|b|hello|dog)$/.test(symbolic)) {
    // @witness the anchored alternation admits only a|b|hello|dog, so a guard-passer outside that set cannot exist
    __IS_SAT__(!(symbolic === "a" || symbolic === "b" || symbolic === "hello" || symbolic === "dog"), false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
