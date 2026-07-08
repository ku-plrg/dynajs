var x = 'ab,cd';

__set_taint__(x);

var y = x.split(',')[1];

__assert__(__is_tainted__(y));
__assert__(__is_tainted_at__(y, 0));
__assert__(__is_tainted_at__(y, 1));
