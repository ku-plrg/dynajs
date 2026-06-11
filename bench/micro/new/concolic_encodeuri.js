// @type concolic
// @oracle true
// @target es5 encodeuri
// @feature builtin encodeURI-unmodeled
// Mirrors ExpoSE else/bug19 (symbolic encodeURI modeled as identity): encodeURI
// maps "a b" -> "a%20b" uniquely, so under encodeURI(x) === "a%20b" the input is
// pinned to "a b" and the assert "x === 'a b'" is necessarily valid -> detected.

var x = __symbolic__("x", "a b");
if (encodeURI(x) === "a%20b") {
  __symbolic_assert__(x === "a b");
}
