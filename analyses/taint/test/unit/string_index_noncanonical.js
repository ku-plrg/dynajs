// Reading a string by index keeps the taint; keys that are not in-range
// integer indices ("-0", "1.5", out of range) read like the engine does.
var x = 'asdf';
__set_taint__(x);

__assert__(__is_tainted__(x[1]));
__assert__(x['-0'] === undefined);
__assert__(x['1.5'] === undefined);
__assert__(x['01'] === undefined);
__assert__(x[4] === undefined);
console.log('ok');
