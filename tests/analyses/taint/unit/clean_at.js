var x = 'asdf';

var y = x.at(0);

__assert__(!__is_tainted__(y));
__assert__(!__is_tainted_at__(y, 0));
