// @type taint
// @target es5 String.prototype.indexOf
// @feature builtin indexOf

// var x0 = "h";
// var x1 = "e";
// var x2 = "l";
// var x3 = "l";
// var x4 = "o";
// __set_taint__(x0);
// __set_taint__(x2);
// __set_taint__(x4);
// var x = x0 + x1 + x2 + x3 + x4;
// __assert_taint__(x.length, true);

var x = 4;
__set_taint__(x);
var y = 8;
__assert_taint__(x < y, true);