var prefix = '1234';
var suffix = 'abcd';

__set_taint__(suffix);

var z = prefix + suffix;

__assert__(!__is_tainted_at__(z, 0));
__assert__(!__is_tainted_at__(z, 3));
__assert__(__is_tainted_at__(z, 4));
__assert__(__is_tainted_at__(z, 7));
