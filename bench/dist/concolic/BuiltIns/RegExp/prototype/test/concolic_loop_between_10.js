// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a{0,3}$/.test(symbolic)) {
    // @witness the anchored a{0,3} admits only 0..3 "a" characters, so every guard-passer is one of those four strings
    __IS_SAT__(!(symbolic === "" || symbolic === "a" || symbolic === "aa" || symbolic === "aaa"), false);
  }
}

__test_symbolic__(__symbolic__("s", "a"));
