// @type taint
// @target es5 JSON.stringify
// @feature builtin json-stringify
// JSON.stringify taint (NodeMedic-FINE builtin_model_bugs.ts BUG B11 + B12): a
// nested property value flows through verbatim, while the structural quotes the
// function itself inserts must stay clean.

// nested tainted property value flows out. JSON.stringify({a:taint("SEC")})
// === '{"a":"SEC"}'; probe the 'S' at index 6.  (B11)
var jv = "SEC";
__set_taint__(jv);
var jr = JSON.stringify({ a: jv }); // '{"a":"SEC"}'
__assert_taint__(jr[6], true); // 'S', from the tainted property value

// structural quotes are inserted by JSON.stringify and are NOT user data.
// JSON.stringify("ab") === '"ab"'; the opening quote must stay clean.  (B12)
var jb = "ab";
__set_taint__(jb);
var qr = JSON.stringify(jb); // '"ab"'
__assert_taint__(qr[0], false); // '"', structural quote
