// @type taint
// @oracle true
// @target es5 Array.prototype.join
// @feature builtin join-tainted-separator
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B6: Array.join must propagate
// the separator's taint. ["a","b"].join("XX") === "aXXb"; with a tainted (e.g.
// user-controlled) separator, the glue bytes at indices 1,2 are tainted. A model
// that writes the delimiter unconditionally untainted under-tracks them. We probe
// the first separator char; the correct answer is tainted.

var sep = "XX";
__set_taint__(sep);
var arr = ["a", "b"];
var y = arr.join(sep); // "aXXb"

__print_if_tainted__(y[1]); // 'X', from the tainted separator
