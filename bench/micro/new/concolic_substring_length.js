// @type concolic
// @oracle true
// @target es5 string-substring
// @feature builtin substring-length-vs-end
// Mirrors ExpoSE string-model-bugs bug 1a/1c: substring's 2nd arg is an END
// index, but ExpoSE models it as a LENGTH (substr semantics). The assert is
// deliberately unguarded (no branch to miss, no PC) and states the
// discriminating property directly: substring(1, 3) spans s[1..3) and can
// never exceed 2 chars. The substr-as-length model admits a 3-char window
// -> refutable -> clean. Keeping the assert unconditional also defeats
// bug 1a's concrete corruption (substring executed as substr), which would
// otherwise steer the seed run away from a guarded assert.

var s = __symbolic__("s", "hello");
var p = s.substring(1, 3); // s[1..3): at most 2 chars
__symbolic_assert__(p.length <= 2);
