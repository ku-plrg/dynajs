// @type taint
// @target es5 JSON.stringify
// @feature builtin json-stringify

var jv = "SEC";
__set_taint__(jv);
var jr = JSON.stringify({ a: jv });
__assert_taint__(jr[6], true);

var jb = "ab";
__set_taint__(jb);
var qr = JSON.stringify(jb);
__assert_taint__(qr[0], false);
