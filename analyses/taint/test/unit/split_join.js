var x = 'abcd';

__set_taint__(x);

var y = x.split('').join('');

__assert__(__is_tainted__(y));
__assert__(__is_tainted_at__(y, 0));
__assert__(__is_tainted_at__(y, 3));
