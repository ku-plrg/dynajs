var x = 'asdf';

var y = x['1'];

__assert__(!__is_tainted__(y));
__assert__(!__is_tainted_at__(y, 0));
