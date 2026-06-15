// @type concolic
// @target es5 string-equality
// @feature syntax string-equality
// String (dis)equality under a path condition. Each case uses its own symbol so
// the accumulated path conditions stay independent.

// under s === "admin", the disequality s !== "guest" is necessarily true (valid).
var se_s = __symbolic__("se_s", "admin");
if (se_s === "admin") {
  __symbolic_assert__(se_s !== "guest", true);
}

// no path condition: s === "target" is trivially violable (clean).
var su_s = __symbolic__("su_s", "q");
__symbolic_assert__(su_s === "target", false);
