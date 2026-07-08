var x = 'asdf';

__set_taint__(x);

x = 'asdf';

const is = __is_tainted__(x);

__assert__(!is);
