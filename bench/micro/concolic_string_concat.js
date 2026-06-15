// @type concolic
// @target es5 string-concat
// @feature syntax string-concat
// `+` as concatenation, including coercion of a number operand to string. Each
// case uses its own symbol so the accumulated path conditions stay independent.

// string concat: under s + "!" === "ab!", s is pinned to "ab" (valid).
var sc_s = __symbolic__("sc_s", "ab");
if (sc_s + "!" === "ab!") {
  __symbolic_assert__(sc_s === "ab", true);
}

// number operand coerced: s + 1 === "ab1" pins s to "ab" (valid).  (ExpoSE bug 8)
var cn_s = __symbolic__("cn_s", "ab");
if (cn_s + 1 === "ab1") {
  __symbolic_assert__(cn_s === "ab", true);
}

// symbolic NUMBER coerced to string: ("" + x) === "42" pins x to 42 (valid).
// (ExpoSE coercion/bug32)
var ts_x = __symbolic__("ts_x", 42);
if ("" + ts_x === "42") {
  __symbolic_assert__(ts_x === 42, true);
}
