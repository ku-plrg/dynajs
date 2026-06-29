// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(a)([a-z])(hello)(....)\4\3\1$/.test(symbolic)) {
    // @witness group (a) is the anchored ^ first char, so the leading char is always exactly "a"
    __IS_SAT__(symbolic[0] !== "a", false);
  }
}

__test_symbolic__(__symbolic__('s', "abhellowxyzwxyzhelloa"));
