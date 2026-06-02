var x = 'asdf';
var y = 'foo';

__set_taint__(x);

__assert__(!__is_tainted__(y));
