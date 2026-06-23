// @type concolic
// @target es6+ RegExp.prototype.exec
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  var re = /^(?=([0-9])).$/;
  var re2 = /^[0-9]$/;
  var r = re.exec(symbolic);
  if (r) {
    // @witness a successful match pins r[0] to a single digit char, so re2 /^[0-9]$/ always matches it
    __IS_SAT__(!(re2.test(r[0])), false);
  }
}

__test_symbolic__(__symbolic__('s', "5"));
