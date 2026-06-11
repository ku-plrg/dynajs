// @type concolic
// @oracle true
// @target es5 array-pop
// @feature builtin array-pop-unmodeled
// Mirrors ExpoSE arrays/bug29: pop()'s bogus args check wipes ExpoSE's symbolic
// array on every call. Ground truth: a.pop() removes the last element, leaving a[0],
// so under a[0] === "secret" the assert "a.length >= 1" is valid -> detected.

var a = __symbolic__("a", ["secret", "x"]);
a.pop();
if (a[0] === "secret") {
  __symbolic_assert__(a.length >= 1);
}
