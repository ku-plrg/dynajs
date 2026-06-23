// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^[^0-9]$/.test(symbolic)) {
    // @witness a single char cannot be both outside [0-9] and inside [0-9]
    __IS_SAT__(/^[0-9]$/.test(symbolic), false);
  }
}

__test_symbolic__(__symbolic__("s", "#"));
