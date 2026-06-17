// @type concolic
// @target es5 string-concat
// @feature syntax string-concat

var sc_s = __symbolic__("sc_s", "ab");
if (sc_s + "!" === "ab!") {
  __symbolic_assert__(sc_s === "ab", true);
} else {
  __symbolic_assert__(false, true);
}

var cn_s = __symbolic__("cn_s", "ab");
if (cn_s + 1 === "ab1") {
  __symbolic_assert__(cn_s === "ab", true);
} else {
  __symbolic_assert__(false, true);
}

var ts_x = __symbolic__("ts_x", 42);
if ("" + ts_x === "42") {
  __symbolic_assert__(ts_x === 42, true);
} else {
  __symbolic_assert__(false, true);
}
