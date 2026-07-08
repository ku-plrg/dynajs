var x = 'asdf';

__set_taint__(x);

var y = x + '1234';

const is = __is_tainted__(y);

console.log(is);

__assert__(is);
