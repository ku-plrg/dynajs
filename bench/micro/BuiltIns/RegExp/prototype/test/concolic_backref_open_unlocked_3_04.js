// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^((.)\2)+$/.test(symbolic)) {
    // @witness "aaaaa" has odd length so cannot match ((.)\2)+ which requires identical-char pairs, so the guard excludes it
    __IS_SAT__(symbolic === "aaaaa", false);
  }
}

__test_symbolic__(__symbolic__('s', "aabb"));
