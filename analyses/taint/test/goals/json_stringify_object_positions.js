// Char-level precision for objects: only the bytes from the tainted value are
// tainted; the structural punctuation and the (clean) key are not.
//   out === {"k":"secret"}
//   idx: 0:{ 1:" 2:k 3:" 4:: 5:" 6:s 7:e 8:c 9:r 10:e 11:t 12:" 13:}
var v = 'secret';

__set_taint__(v);

var o = { k: v };

var out = JSON.stringify(o);

__assert__(!__is_tainted_at__(out, 0)); // {
__assert__(!__is_tainted_at__(out, 2)); // k  (key, not the tainted value)
__assert__(__is_tainted_at__(out, 6)); // s
__assert__(__is_tainted_at__(out, 11)); // t
__assert__(!__is_tainted_at__(out, 13)); // }
