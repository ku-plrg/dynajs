// @type taint
// @target es6+ String.prototype.at
// @feature builtin at

var ox = "asdf";
__set_taint__(ox);
__assert_taint__(ox.at(99), false);

var bx = "asdf";
var bch = bx.at(0);
__set_taint__(bx);
__assert_taint__(bch, false);

var cx = "asdf";
__assert_taint__(cx.at(0), false);

function atf(s) { return "pre" + s.at(0); }
var ax = "abc";
__set_taint__(ax);
__assert_taint__(atf(ax), true);
