// @type taint
// @oracle true
// @target es5 encodeURIComponent
// @feature builtin encodeURIComponent
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B10 (and ExpoSE else/bug18):
// encodeURIComponent must preserve the taint of its argument's bytes. With a
// partially tainted input ("x" + taint("SEC") = "xSEC", only bytes 1..3 tainted),
// the result "xSEC" keeps those tainted bytes. A model that reads only a whole-
// value taint bit treats the partly tainted arg as clean and drops all taint;
// ExpoSE's model even returns undefined for a concrete arg. We probe a result byte
// that came from the secret; correct = tainted.

var secret = "SEC";
__set_taint__(secret);
var mixed = "x" + secret; // "xSEC": byte 0 clean, bytes 1..3 tainted
var r = encodeURIComponent(mixed); // "xSEC" (no chars need escaping)

__print_if_tainted__(r[1]); // 'S', derived from the tainted secret
