// @type concolic
// @target es5 string-substring
// @feature builtin substring
// String.prototype.substring as str.substr(s, start, len), with the spec's end-
// index, negative-clamp, and arg-swap semantics (ExpoSE string-model bug 1a/1c).
// Each case uses its own symbol so the accumulated path conditions stay independent.

// substring(0,2) flows: under p === "he", s has >= 2 chars (valid).
var si_s = __symbolic__("si_s", "hello");
if (si_s.substring(0, 2) === "he") {
  __symbolic_assert__(si_s.length >= 2, true);
}

// the 2nd arg is an END index, not a length: substring(1,3) === "el"; under
// p === "el", s.length >= 3 is valid.
var sln_s = __symbolic__("sln_s", "hello");
if (sln_s.substring(1, 3) === "el") {
  __symbolic_assert__(sln_s.length >= 3, true);
}

// negative start clamps to 0: substring(-3,5) === substring(0,5) for all s (valid).
var nc_s = __symbolic__("nc_s", "abcde");
__symbolic_assert__(nc_s.substring(-3, 5) === nc_s.substring(0, 5), true);

// args swap when start > end: substring(4,1) === substring(1,4) for all s (valid).
var sw_s = __symbolic__("sw_s", "hello");
__symbolic_assert__(sw_s.substring(4, 1) === sw_s.substring(1, 4), true);
