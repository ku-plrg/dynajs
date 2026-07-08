var x = 'asdf';

__set_taint__(x);

var y = x.at(0);
var z = y.at(0);

__assert__(__is_tainted__(z));
__assert__(__is_tainted_at__(z, 0));
