// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^[^a-z]$/.test(symbolic)) {
    // @witness a single char cannot be both outside [a-z] and inside [a-z]
    __IS_SAT__(/^[a-z]$/.test(symbolic), false);
  }
}

__test_symbolic__(__symbolic__("s", "#"));
