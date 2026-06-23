// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(.)(\1b)+$/.test(symbolic)) {
    // @witness every (\1b) repetition ends in "b" and $ pins the match to the end, so the final char is always "b"
    __IS_SAT__(symbolic[symbolic.length - 1] !== "b", false);
  }
}

__test_symbolic__(__symbolic__("s", "aab"));
