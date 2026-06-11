// @type taint
// @oracle false
// @target es5 JSON.stringify
// @feature builtin json-stringify-quote
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B12 (over-taint / false
// positive): JSON.stringify('ab') === '"ab"' wraps the value in structural quotes
// that the function itself inserts. Those quotes are NOT user data and must stay
// untainted even though the string content is fully tainted. A model that blanket-
// taints the whole result over-taints the opening quote. We probe r[0] (the
// opening '"'); correct = clean.

var base = "ab";
__set_taint__(base);
var r = JSON.stringify(base); // '"ab"'

__print_if_tainted__(r[0]); // '"', structural quote inserted by JSON.stringify
