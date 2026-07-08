var x = 'abcd';

__set_taint__(x);

var c = x.at(2);
var s = 'XX' + c;

__assert__(__is_tainted__(s));
__assert__(!__is_tainted_at__(s, 0));
__assert__(!__is_tainted_at__(s, 1));
__assert__(__is_tainted_at__(s, 2));
