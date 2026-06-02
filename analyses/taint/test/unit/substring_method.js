var x = 'abcdef';

__set_taint__(x);

var y = x.substring(2, 4);

__assert__(__is_tainted__(y));
__assert__(__is_tainted_at__(y, 0));
__assert__(__is_tainted_at__(y, 1));
