// @type concolic
// @target es5 binary-relational
// @feature syntax binary-relational
// Relational guards and the path condition they record — including a negated
// branch (the else records ¬cond) and the value-aliasing regression guard. Each
// case uses its own symbol so the accumulated path conditions stay independent.

// path implies assert: under x > 0 (integers), x >= 1 is valid.
var im_x = __symbolic__("im_x", 5);
if (im_x > 0) {
  __symbolic_assert__(im_x >= 1, true);
}

// negated branch: the else records ¬(x > 0) -> x <= 0 is valid. The if-branch
// assert (`false`) isn't reached for this seed; it would be violable, so it
// carries expected=false.
var eb_x = __symbolic__("eb_x", -4);
if (eb_x > 0) {
  __symbolic_assert__(false, false);
} else {
  __symbolic_assert__(eb_x <= 0, true);
}

// counterexample: x > 0 does not pin x to 2 (x = 1 breaks it) -> violable (clean).
var vi_x = __symbolic__("vi_x", 7);
if (vi_x > 0) {
  __symbolic_assert__(vi_x === 2, false);
}

// no path condition: x === 2 is trivially violable (clean).
var un_x = __symbolic__("un_x", 7);
__symbolic_assert__(un_x === 2, false);

// REGRESSION GUARD (value-aliasing): the seed (2) equals the literal 2 in the
// assert. Identity-wrapping keeps them distinct, so this correctly extracts
// (x === 2), finds the counterexample under x > 0, and reports clean. If it ever
// flips to detected, the aliasing bug has regressed.
var al_x = __symbolic__("al_x", 2);
if (al_x > 0) {
  __symbolic_assert__(al_x === 2, false);
}
