// Post-hoc binary ops must propagate info from the frame's lifted operands —
// the hook's own left/right are the peeked raws binaryPre handed to native
// execution, so deriving info from them silently drops taint.
var x = 5;
__set_taint__(x);

var minus = x - 1;
__assert__(__is_tainted__(minus));

var times = x * 2;
__assert__(__is_tainted__(times));

var less = x < 10;
__assert__(__is_tainted__(less));
