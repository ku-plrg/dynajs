// @type concolic
// @target es5 array-index
// @feature builtin symbolic-array-index
// A symbolic index into a symbolic array: arr[i] is select(arr, i), guarded by
// the element-access bound 0 <= i < arr.length (ExpoSE symbolicField). So under
// arr[i] === "y" the array is non-empty and arr.length >= 1 is valid -> detected.

var arr = __symbolic__("arr", ["x", "y", "z"]);
var i = __symbolic__("i", 1);
if (arr[i] === "y") {
  __symbolic_assert__(arr.length >= 1, true);
}
