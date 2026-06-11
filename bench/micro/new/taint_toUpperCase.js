// @type taint
// @oracle true
// @target es6+ String.prototype.toUpperCase
// @feature builtin toUpperCase
// Mirrors NodeMedic-FINE string_model_bugs.ts BUG A4 (toLowerCase counterpart is
// new/taint_toLowerCase.js / BUG B4): a case conversion that GROWS in length is
// modeled length-preserving. "ß".toUpperCase() === "SS" (1 char -> 2). Both result
// chars derive from the tainted base, but a length-preserving model produces a
// length-1 result and the 2nd char goes untracked. We probe index 1.

var x = "ß";
__set_taint__(x);
var y = x.toUpperCase(); // "SS"

__print_if_tainted__(y[1]); // 2nd 'S', derived from the tainted base
