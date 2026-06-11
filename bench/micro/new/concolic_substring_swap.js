// @type concolic
// @oracle true
// @target es5 string-substring
// @feature builtin substring-swap-tautology
// Mirrors ExpoSE string-model-bugs bug 1a/1c: substring(a,b) is defined as
// substring(min,max), so "s.substring(4,1) === s.substring(1,4)" is a tautology for
// every string s -> provably valid (detected). Both models that keep the raw
// (unswapped) start window miss this.

var s = __symbolic__("s", "hello");
__symbolic_assert__(s.substring(4, 1) === s.substring(1, 4));
