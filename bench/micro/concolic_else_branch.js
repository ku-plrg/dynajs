// @type concolic
// @oracle true
// @target es5 binary-relational
// @feature syntax negated-branch
// The else branch records the *negated* condition: reaching it means ¬(x > 0),
// which over the integers makes x <= 0 necessarily true.

var x = __symbolic__("x", -4);
if (x > 0) {
  __symbolic_assert__(false);
} else {
  __symbolic_assert__(x <= 0);
}
