var x = 'asdf';

var y = x.at(0);

__set_taint__(x);

__assert__(!__is_tainted__(y));
