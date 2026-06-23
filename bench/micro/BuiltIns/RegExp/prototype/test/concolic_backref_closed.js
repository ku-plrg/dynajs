// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(.)\1$/.test(symbolic)) {
    // @witness \1 forces char 1 to equal captured char 0, so the two chars can never differ
    __IS_SAT__(symbolic[0] !== symbolic[1], false);
  }
}

__test_symbolic__(__symbolic__('s', "aa"));
