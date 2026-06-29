// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(a)\1+$/.test(symbolic)) {
    // @witness /^(a)\1+$/ forces every char to equal the captured "a", so symbolic[0] is always "a"
    __IS_SAT__(symbolic[0] !== "a", false);
  }
}

__test_symbolic__(__symbolic__('s', "aa"));
