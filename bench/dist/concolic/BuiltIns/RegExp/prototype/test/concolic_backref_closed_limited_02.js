// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(a)\1(a)\2$/.test(symbolic)) {
    // @witness \2 pins char 3 to the captured "a" of group 2, so it can never differ from char 2
    __IS_SAT__(symbolic[2] !== symbolic[3], false);
  }
}

__test_symbolic__(__symbolic__('s', "aaaa"));
