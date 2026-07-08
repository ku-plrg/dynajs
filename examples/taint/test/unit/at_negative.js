var x = 'asdf';

__set_taint__(x);

var y = x.at(-1);

__assert__(__is_tainted__(y));
__assert__(__is_tainted_at__(y, 0));
