var n = 42;

__set_taint__(n);

var s = 'pre' + n + 'suf';

__assert__(__is_tainted__(s));
__assert__(!__is_tainted_at__(s, 0));
__assert__(!__is_tainted_at__(s, 2));
__assert__(__is_tainted_at__(s, 3));
__assert__(__is_tainted_at__(s, 4));
__assert__(!__is_tainted_at__(s, 5));
__assert__(!__is_tainted_at__(s, 7));
