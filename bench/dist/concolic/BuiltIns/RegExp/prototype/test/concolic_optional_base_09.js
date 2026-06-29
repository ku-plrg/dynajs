// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a?b?c?$/.test(symbolic)) {
    // @witness /^a?b?c?$/ admits only the 8 listed strings, so the disjunction always holds under the guard
    __IS_SAT__(!(symbolic === "" || symbolic === "a" || symbolic === "b" || symbolic === "c" || symbolic === "ab" || symbolic === "ac" || symbolic === "bc" || symbolic === "abc"), false);
  }
}

__test_symbolic__(__symbolic__('s', ""));
