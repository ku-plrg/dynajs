// @type taint
// @target es2024 String.prototype.isWellFormed
// @feature builtin isWellFormed

function test(x1) {
    var x = 'h' + x1 + 'i';

    // @witness isWellFormed returns a boolean
    __assert_taint__(x.isWellFormed(), false);
}

var x1 = 'x';
__set_taint__(x1);
test(x1);
