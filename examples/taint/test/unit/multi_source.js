var a = 'foo';
var b = 'barbaz';

__set_taint__(a);
__set_taint__(b);

var z = a + b;

__assert__(__is_tainted__(z));
__assert__(__is_tainted_at__(z, 0));
__assert__(__is_tainted_at__(z, 2));
__assert__(__is_tainted_at__(z, 3));
__assert__(__is_tainted_at__(z, 8));
