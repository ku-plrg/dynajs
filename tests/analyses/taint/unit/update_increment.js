// ++/-- (the Up hook) must coerce via the pre-hook's unlifted operand — a
// lifted operand has no valueOf, so skipping that step yields NaN.
var n = 1;
n++;
__assert__(n === 2);

var post = n++;
__assert__(post === 2);
__assert__(n === 3);

var pre = ++n;
__assert__(pre === 4);
__assert__(n === 4);

var d = 1.5;
d--;
__assert__(d === 0.5);
