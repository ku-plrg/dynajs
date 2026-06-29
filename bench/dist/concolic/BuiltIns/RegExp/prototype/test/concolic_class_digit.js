// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^\d$/.test(symbolic)) {
    // @witness the \d guard forces a single digit, so /^[0-9]$/ always matches and its negation can never hold
    __IS_SAT__(!/^[0-9]$/.test(symbolic), false);
  }
  if (/^\D$/.test(symbolic)) {
    // @witness the \D guard forces a single non-digit, so /^[0-9]$/ can never match
    __IS_SAT__(/^[0-9]$/.test(symbolic), false);
  }
}

__test_symbolic__(__symbolic__("s", "5"));
