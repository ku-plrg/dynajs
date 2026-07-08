var x = 'ab';

__set_taint__(x);

var y = x.repeat(3);

__assert__(__is_tainted__(y));
__assert__(__is_tainted_at__(y, 0));
__assert__(__is_tainted_at__(y, 1));
__assert__(__is_tainted_at__(y, 4));
__assert__(__is_tainted_at__(y, 5));
