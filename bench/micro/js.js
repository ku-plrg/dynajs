// @type taint
// @oracle true
// @target es5 var-assignment
// @feature syntax identifier-copy

var x = 'asdf';

__set_taint__(x);

var y = x;

__print_if_tainted__(y);