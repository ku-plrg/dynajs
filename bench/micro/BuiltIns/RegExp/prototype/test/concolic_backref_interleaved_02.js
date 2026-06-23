// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (/^(a)([a-z])(hello)(....)\4\3\1$/.test(symbolic)) {
    // @witness final \1 backref re-emits group (a)="a" right before $, so the last char is always "a"
    __IS_SAT__(symbolic[symbolic.length - 1] !== "a", false);
  }
}

__test_symbolic__(__symbolic__('s', "abhellowxyzwxyzhelloa"));
