// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^\w$/.test(symbolic)) {
    // @witness \w is exactly [a-zA-Z0-9_], so a char matching \w always matches the class
    __IS_SAT__(!/^[a-zA-Z0-9_]$/.test(symbolic), false);
  }
  if (/^\W$/.test(symbolic)) {
    // @witness \W is the complement of [a-zA-Z0-9_], so a char matching \W can never match the class
    __IS_SAT__(/^[a-zA-Z0-9_]$/.test(symbolic), false);
  }
}

__test_symbolic__(__symbolic__("s", "a"));
