var x = 'asdf';

__set_taint__(x);

x = 'asdf'; // reassigning should remove taint

assert(!__is_tainted__(x));