// @type taint
// @oracle false
// @target es5 String.prototype.slice
// @feature builtin slice-cjk-untainted
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B5 (over-taint / false
// positive): a Plane-15 taint encoding that aliases code-point bit 0x1000 with the
// taint bit makes untainted CJK/Hiragana chars (e.g. 'あ' U+3042) decode as tainted
// after any precise string op. Here only 'A' is tainted; 'あ' is clean and must
// stay clean through slice. We probe 'あ'; the correct answer is clean.

var a = "A";
__set_taint__(a);
var s = a + "あ"; // 'A' tainted, 'あ' (U+3042) clean
var y = s.slice(0); // "Aあ"

__print_if_tainted__(y[1]); // 'あ', untainted
