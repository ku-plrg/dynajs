var x = 'asdf';

__set_taint__(x);

assert(__is_tainted__(x));