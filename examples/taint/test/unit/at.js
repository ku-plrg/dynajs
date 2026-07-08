var x = 'asdf';

__set_taint__(x);

var y = x.at(0);

const is = __is_tainted__(y);

console.log(is);

__assert__(is);
