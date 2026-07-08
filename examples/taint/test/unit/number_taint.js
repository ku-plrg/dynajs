var n = 5;

__set_taint__(n);

var m = n + 1;

__assert__(__is_tainted__(m));
