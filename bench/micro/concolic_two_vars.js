// @type concolic
// @oracle true
// @target es5 arithmetic
// @feature syntax two-symbols
// Two symbolic inputs: under the path condition a > b, the difference a - b is
// necessarily positive, so `(a - b) > 0` is valid.

var a = __symbolic__("a", 8);
var b = __symbolic__("b", 3);
if (a > b) {
  __symbolic_assert__(a - b > 0);
}
