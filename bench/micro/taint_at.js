// @type taint
// @target es6+ String.prototype.at
// @feature builtin at
// ported from unit/at_oob.js, unit/before_taint.js, unit/clean_at.js,
// unit/transparent_preserves_chars.js

// out-of-bounds .at returns undefined -> clean.
var ox = "asdf";
__set_taint__(ox);
__assert_taint__(ox.at(99), false);

// .at read BEFORE the source is tainted captures the (then-clean) char.
var bx = "asdf";
var bch = bx.at(0);
__set_taint__(bx);
__assert_taint__(bch, false);

// .at on a never-tainted string is clean.
var cx = "asdf";
__assert_taint__(cx.at(0), false);

// taint flows through a function boundary: f(s) = "pre" + s.at(0).
function atf(s) { return "pre" + s.at(0); }
var ax = "abc";
__set_taint__(ax);
__assert_taint__(atf(ax), true);
