// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-cookie-match

function __test_symbolic__(symbolic) {
  if (symbolic) {
    if (/iPhone/.exec(symbolic)) {
      // @witness a successful /iPhone/.exec match means "iPhone" is a substring, so indexOf can never be -1
      __IS_SAT__(symbolic.indexOf("iPhone") === -1, false);
    }
  }
}

__test_symbolic__(__symbolic__('s', "iPhone"));
