// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (symbolic.length < 10) {
    var s = symbolic.match(/<([a-z]+)>(.*?)<\/\1>/);
    if (s) {
      // @witness capture group 1 is [a-z]+ which requires at least one character, so s[1].length is always >= 1 and s[1].length <= 0 is impossible
      __IS_SAT__(s[1].length <= 0, false);
    }
  }
}

__test_symbolic__(__symbolic__("s", "<a>x</a>"));
