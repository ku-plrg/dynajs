var x = 'asdf';

__set_taint__(x);

const is = __is_tainted__(x);

console.log(is);

__assert__(is);
