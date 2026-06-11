// @type taint
// @oracle true
// @target es6+ String.prototype.trimStart
// @feature builtin trim-whitespace-class
// Mirrors ExpoSE string-model-bugs bug 4 (the `isWhite` facet: it treated ONLY
// ' ' as whitespace, ignoring tab/newline). trim/trimStart must strip every
// whitespace char, including a leading TAB: ("\t" + taint("ab")).trimStart() ===
// "ab" -> index 0 is the tainted 'a'. A model whose whitespace test only matches
// ' ' leaves the tab in place, so index 0 reads as the clean '\t'. We probe index
// 0; correct = tainted. (The companion symbolic off-by-one facet of bug 4 is not
// modeled symbolically by dynajs — see concolic placeholders.)

var x = "ab";
__set_taint__(x);
var s = "\t" + x;
var y = s.trimStart(); // "ab" (leading tab stripped)

__print_if_tainted__(y[0]); // 'a', tainted
