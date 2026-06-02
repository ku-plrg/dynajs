var x = 'abc';

__set_taint__(x);

var y = String(x);

__assert__(__is_tainted__(y));
__assert__(__is_tainted_at__(y, 0));
__assert__(__is_tainted_at__(y, 1));
__assert__(__is_tainted_at__(y, 2));
