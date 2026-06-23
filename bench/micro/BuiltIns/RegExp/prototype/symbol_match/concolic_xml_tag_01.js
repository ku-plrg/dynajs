// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-backreference

function __test_symbolic__(symbolic) {
  if (symbolic.length < 10) {
    var s = symbolic.match(/<([a-z]+)>(.*?)<\/\1>/);
    if (s) {
      // @witness the regex begins with the literal "<", so the whole match s[0] always starts with "<" and s[0].charAt(0) !== "<" is impossible
      __IS_SAT__(s[0].charAt(0) !== "<", false);
    }
  }
}

__test_symbolic__(__symbolic__("s", "<a>x</a>"));
