var x = 'abcd';

__set_taint__(x);

var y = x.at(0);

__assert__(__is_tainted_at__(y, 0));
