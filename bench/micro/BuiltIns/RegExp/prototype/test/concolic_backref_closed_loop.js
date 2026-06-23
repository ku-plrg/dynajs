// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(.)\1+$/.test(symbolic)) {
    // @witness \1+ forces every char to equal the captured char 0, so char 1 can never differ from char 0
    __IS_SAT__(symbolic.charAt(1) !== symbolic.charAt(0), false);
  }
}

__test_symbolic__(__symbolic__('s', "aa"));
