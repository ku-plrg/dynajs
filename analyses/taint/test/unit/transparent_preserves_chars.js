function f(s) {
  return 'pre' + s.at(0);
}

var x = 'abc';

__set_taint__(x);

var y = f(x);

__assert__(__is_tainted__(y));
__assert__(!__is_tainted_at__(y, 0));
__assert__(!__is_tainted_at__(y, 1));
__assert__(!__is_tainted_at__(y, 2));
__assert__(__is_tainted_at__(y, 3));
