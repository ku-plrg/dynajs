// @type taint
// @target es5 String.prototype.localeCompare
// @feature builtin localeCompare

var x = "banana";
__set_taint__(x);
__assert_taint__(x.localeCompare("apple"), false);
__assert_taint__(x.localeCompare("banana"), false);
__assert_taint__(x.localeCompare("cherry"), false);
