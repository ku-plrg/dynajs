var a = '12';
var b = 'XY';
var c = '34';

__set_taint__(b);

var z = a + b + c;

__assert__(__is_tainted__(z));
__assert__(!__is_tainted_at__(z, 0));
__assert__(!__is_tainted_at__(z, 1));
__assert__(__is_tainted_at__(z, 2));
__assert__(__is_tainted_at__(z, 3));
__assert__(!__is_tainted_at__(z, 4));
__assert__(!__is_tainted_at__(z, 5));
