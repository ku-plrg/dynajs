// @type taint
// @oracle false
// @target es6+ String.prototype.trimRight
// @feature builtin trimRight-not-trim
// Mirrors ExpoSE string-model-bugs bug 3: trimRight/trimLeft (and the V8-aliased
// trimEnd/trimStart) were wired to the full trim by a copy-paste, so trimRight
// wrongly stripped the LEADING run too. trimRight must remove ONLY trailing
// whitespace: with clean leading spaces, a tainted core, and clean trailing
// spaces, ("  " + taint("ab") + "  ").trimRight() === "  ab" -> index 0 is a CLEAN
// leading space. A model that runs full trim drops the leading run and shifts a
// tainted char into index 0 (over-taint). We probe index 0; correct = clean.

var x = "ab";
__set_taint__(x);
var s = "  " + x + "  ";
var y = s.trimRight(); // "  ab" (leading run kept)

__print_if_tainted__(y[0]); // ' ', clean leading space
