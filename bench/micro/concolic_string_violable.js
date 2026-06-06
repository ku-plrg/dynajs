// @type concolic
// @oracle false
// @target es5 string-length
// @feature syntax counterexample
// A non-empty string is not pinned to any single value: str.len(s) > 0 admits
// e.g. s = "ab", which breaks `s === "x"`, so `PC ∧ ¬(s === "x")` is SAT -> the
// assert is not valid.

var s = __symbolic__("s", "whatever");
if (s.length > 0) {
  __symbolic_assert__(s === "x");
}
