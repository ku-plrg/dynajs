// Known hole: Up() hands binaryPre the peeked raw oldValue (`-(-operand)`),
// so the frame carries no lifted identity and info dies across ++/-- — while
// the same value survives a plain binary `+` (asserted below as a guard, so
// this goal only turns on the ++ fix, not on taint-on-numbers breaking).
var n = 1;
__set_taint__(n);
__assert__(__is_tainted__(n));

var m = n + 1;
__assert__(__is_tainted__(m));

n++;
__assert__(__is_tainted__(n));
