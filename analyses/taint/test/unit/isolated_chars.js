var x = '12345';
var y = '67890';

__set_taint__(x);

__assert__(!__is_tainted_at__(y, 0));
__assert__(!__is_tainted_at__(y, 2));
__assert__(!__is_tainted_at__(y, 4));
