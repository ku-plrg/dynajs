var b = true;

__set_taint__(b);

var v = !b;

__assert__(__is_tainted__(v));
