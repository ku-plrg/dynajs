// @type taint
// @target es5 String.prototype.charAt
// @feature builtin charAt
// ported from unit/char_at.js

// charAt of a tainted char is tainted.
var ca = "asdf";
__set_taint__(ca);
__assert_taint__(ca.charAt(0), true);

// charAt landing in a clean appended suffix is clean.
var cb = "asdf";
__set_taint__(cb);
cb = cb + "qwer";
__assert_taint__(cb.charAt(4), false); // 'q', from the clean suffix
