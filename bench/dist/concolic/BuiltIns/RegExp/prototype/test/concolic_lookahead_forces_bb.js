// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  if (/^b(?=b).$/.test(symbolic)) {
    // @witness ^b pins charAt(0)="b", the lookahead forces charAt(1)="b" and $ caps length at 2, so only "bb" matches
    __IS_SAT__(symbolic !== "bb", false);
  }
}

__test_symbolic__(__symbolic__('s', "bb"));
