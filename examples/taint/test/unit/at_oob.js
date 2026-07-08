var x = 'asdf';

__set_taint__(x);

var y = x.at(99);

__assert__(!__is_tainted__(y));
