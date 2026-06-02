var x = 'abc';

__set_taint__(x);

var s = `pre${x}suf`;

__assert__(__is_tainted__(s));
__assert__(!__is_tainted_at__(s, 0));
__assert__(!__is_tainted_at__(s, 2));
__assert__(__is_tainted_at__(s, 3));
__assert__(__is_tainted_at__(s, 5));
__assert__(!__is_tainted_at__(s, 6));
__assert__(!__is_tainted_at__(s, 8));
