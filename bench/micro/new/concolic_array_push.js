// @type concolic
// @target es5 array-push
// @feature builtin array-push-unmodeled
// Mirrors ExpoSE arrays/bug28: a type-mismatched push wipes ExpoSE's symbolic array.
// Ground truth: after a.push(0), the existing element a[0] is unchanged and the
// length grows, so under a[0] === "secret" the assert "a.length >= 2" is valid.

var a = __symbolic__("a", ["secret"]);
a.push(0); // number into a string array
if (a[0] === "secret") {
  __symbolic_assert__(a.length >= 2, true);
}
