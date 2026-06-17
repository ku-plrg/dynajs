// @type concolic
// @target es5 string-substring
// @feature builtin substring

var si_s = __symbolic__("si_s", "hello");
if (si_s.substring(0, 2) === "he") {
  __symbolic_assert__(si_s.length >= 2, true);
} else {
  __symbolic_assert__(false, true);
}

var sln_s = __symbolic__("sln_s", "hello");
if (sln_s.substring(1, 3) === "el") {
  __symbolic_assert__(sln_s.length >= 3, true);
} else {
  __symbolic_assert__(false, true);
}

var nc_s = __symbolic__("nc_s", "abcde");
__symbolic_assert__(nc_s.substring(-3, 5) === nc_s.substring(0, 5), true);

var sw_s = __symbolic__("sw_s", "hello");
__symbolic_assert__(sw_s.substring(4, 1) === sw_s.substring(1, 4), true);
