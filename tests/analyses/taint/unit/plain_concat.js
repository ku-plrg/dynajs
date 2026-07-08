var a = 'asdf';
var b = '1234';

var z = a + b;

__assert__(!__is_tainted__(z));
__assert__(!__is_tainted_at__(z, 0));
__assert__(!__is_tainted_at__(z, 4));
__assert__(!__is_tainted_at__(z, 7));
