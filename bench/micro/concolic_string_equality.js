// @type concolic
// @target es5 string-equality
// @feature syntax string-equality

var se_s = __symbolic__("se_s", "admin");
if (se_s === "admin") {
  __symbolic_assert__(se_s !== "guest", true);
} else {
  __symbolic_assert__(false, true);
}

var su_s = __symbolic__("su_s", "q");
__symbolic_assert__(su_s === "target", false);
