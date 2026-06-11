// @type taint
// @oracle true
// @target es5 JSON.stringify
// @feature builtin json-stringify-nested
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B11: JSON.stringify must
// propagate the taint of a nested property's value. JSON.stringify({a: taint("SEC")})
// === '{"a":"SEC"}' and the SEC bytes flow verbatim into the output. A model that
// inspects only the object's own (whole-value) taint bit -- false, since the taint
// lives in a property -- treats the result as clean. We probe the 'S' of "SEC" at
// index 6 of '{"a":"SEC"}'; correct = tainted.

var v = "SEC";
__set_taint__(v);
var o = { a: v };
var r = JSON.stringify(o); // '{"a":"SEC"}'

__print_if_tainted__(r[6]); // 'S', derived from the tainted property value
