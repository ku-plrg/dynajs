var x = 'abcd';

__set_taint__(x);

var y = x + '1234';

__assert__(!__is_tainted_at__(y, 4));
__assert__(!__is_tainted_at__(y, 5));
__assert__(!__is_tainted_at__(y, 6));
__assert__(!__is_tainted_at__(y, 7));
