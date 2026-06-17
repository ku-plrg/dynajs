// @type concolic
// @target es5 binary-relational
// @feature syntax binary-relational

var im_x = __symbolic__("im_x", 5);
if (im_x > 0) {
  __symbolic_assert__(im_x >= 1, true);
} else {
  __symbolic_assert__(false, true);
}

var eb_x = __symbolic__("eb_x", -4);
if (eb_x > 0) {
  __symbolic_assert__(false, true);
} else {
  __symbolic_assert__(eb_x <= 0, true);
}

var vi_x = __symbolic__("vi_x", 7);
if (vi_x > 0) {
  __symbolic_assert__(vi_x === 2, false);
} else {
  __symbolic_assert__(false, true);
}

var un_x = __symbolic__("un_x", 7);
__symbolic_assert__(un_x === 2, false);

var al_x = __symbolic__("al_x", 2);
if (al_x > 0) {
  __symbolic_assert__(al_x === 2, false);
} else {
  __symbolic_assert__(false, true);
}
