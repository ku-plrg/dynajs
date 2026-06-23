// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (symbolic.length < 10) {
    if (/^(.)\1+$/.test(symbolic)) {
      if (symbolic.length > 3) {
        // @witness /^(.)\1+$/ forces every char to equal the backreferenced first char, so charAt(1) can never differ from charAt(0)
        __IS_SAT__(symbolic.charAt(1) !== symbolic.charAt(0), false);
      }
    }
  }
}

__test_symbolic__(__symbolic__('s', "aaaa"));
