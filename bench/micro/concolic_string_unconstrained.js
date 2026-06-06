// @type concolic
// @oracle false
// @target es5 string-equality
// @feature syntax no-path-condition
// With no branch guarding it, the assert sees an empty path condition, so
// `s === "target"` is trivially violable (any other string is a counterexample).

var s = __symbolic__("s", "q");
__symbolic_assert__(s === "target");
