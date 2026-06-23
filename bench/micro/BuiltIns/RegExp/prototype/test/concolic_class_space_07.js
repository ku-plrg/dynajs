// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^\S$/.test(symbolic)) {
    // @witness the \S guard forces a non-whitespace char, which can never equal the whitespace char \f
    __IS_SAT__(symbolic === "\f", false);
  }
}

__test_symbolic__(__symbolic__("s", "s"));
