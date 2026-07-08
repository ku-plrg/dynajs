var t = 'XY';
var a = '12';
var b = '34';

__set_taint__(t);

var s = a.concat(t, b);

__assert__(__is_tainted__(s));
__assert__(!__is_tainted_at__(s, 0));
__assert__(!__is_tainted_at__(s, 1));
__assert__(__is_tainted_at__(s, 2));
__assert__(__is_tainted_at__(s, 3));
__assert__(!__is_tainted_at__(s, 4));
__assert__(!__is_tainted_at__(s, 5));
