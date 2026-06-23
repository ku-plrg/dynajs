// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^((.)\2)+$/.test(symbolic)) {
    // @witness first (.)\2 unit captures char 0 and \2 pins char 1 to it, so chars 0,1 are always equal
    __IS_SAT__(symbolic[0] !== symbolic[1], false);
  }
}

__test_symbolic__(__symbolic__('s', "aa"));
