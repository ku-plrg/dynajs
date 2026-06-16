// @type concolic
// @target es5 array-join
// @feature builtin symbolic-array-join
// Array.prototype.join on a symbolic string array unfolds (over the concrete
// length) into string concatenations of the symbolic elements and separator
// (ExpoSE join). Here the joined value `s` is select(e, 0); the guard pins it to
// "secret", and the independent read e[0] is the same select, so e[0] === "secret"
// is valid -> detected. (Multi-element join content reasoning can exceed z3's
// string-sequence solver and fall to clean, as in ExpoSE.)

var e = __symbolic__("e", ["secret"]);
var s = e.join(",");
if (s === "secret") {
  __symbolic_assert__(e[0] === "secret", true);
}
