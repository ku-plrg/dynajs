// The quote characters JSON.stringify wraps a string in are structural and
// must stay clean; only the bytes derived from the tainted input carry taint.
//   out === "abc"  ->  index 0 ["] 1 [a] 2 [b] 3 [c] 4 ["]
// This is the char-level precision goal for QuoteJSONString (the native-shortcut
// implementation keeps `value` in its dep list, so positions should survive).
var s = 'abc';

__set_taint__(s);

var out = JSON.stringify(s);

__assert__(!__is_tainted_at__(out, 0)); // opening quote
__assert__(__is_tainted_at__(out, 1)); // a
__assert__(__is_tainted_at__(out, 2)); // b
__assert__(__is_tainted_at__(out, 3)); // c
__assert__(!__is_tainted_at__(out, 4)); // closing quote
