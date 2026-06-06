// @type concolic
// @oracle true
// @target es5 string-equality
// @feature syntax string-implies
// Under the path condition s === "admin", the disequality s !== "guest" is
// necessarily true, so `PC ∧ ¬(s !== "guest")` is UNSAT -> the assert is valid.

var s = __symbolic__("s", "admin");
if (s === "admin") {
  __symbolic_assert__(s !== "guest");
}
