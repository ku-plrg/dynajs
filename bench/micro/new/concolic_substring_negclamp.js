// @type concolic
// @oracle true
// @target es5 string-substring
// @feature builtin substring-negclamp-tautology
// Mirrors ExpoSE string-model-bugs bug 1c: a negative substring start clamps to 0,
// so "s.substring(-3,5) === s.substring(0,5)" is a tautology for every string s ->
// provably valid (detected).

var s = __symbolic__("s", "abcde");
__symbolic_assert__(s.substring(-3, 5) === s.substring(0, 5));
