// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(a)\1(a)\2$/.test(symbolic)) {
    // @witness \1 pins char 1 to the captured "a" of group 1, so it can never differ from char 0
    __IS_SAT__(symbolic[0] !== symbolic[1], false);
  }
}

__test_symbolic__(__symbolic__('s', "aaaa"));
