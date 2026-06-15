// @type concolic
// @target es5 string-length
// @feature syntax string-length
// s.length flows as str.len(s). Each case uses its own symbol so the accumulated
// path conditions stay independent.

// under str.len(s) > 3, str.len(s) >= 4 is necessarily true (valid).
var sl_s = __symbolic__("sl_s", "hello");
if (sl_s.length > 3) {
  __symbolic_assert__(sl_s.length >= 4, true);
}

// str.len(s) > 0 does not pin s to any value (e.g. "ab" breaks s === "x") -> clean.
var sv_s = __symbolic__("sv_s", "whatever");
if (sv_s.length > 0) {
  __symbolic_assert__(sv_s === "x", false);
}
