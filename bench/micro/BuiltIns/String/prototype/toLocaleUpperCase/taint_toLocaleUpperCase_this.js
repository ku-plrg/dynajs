// @type taint
// @target es5 String.prototype.toLocaleUpperCase
// @feature builtin toLocaleUpperCase

function test(x1) {
    var x0 = 'a';
    var x2 = 'c';
    var x = x0 + x1 + x2;
    var r = x.toLocaleUpperCase();

    // @witness always r[0]='A'
    __assert_taint__(r[0], false);

    // @witness test('x') => r[1]='X'
    __assert_taint__(r[1], true);

    // @witness always r[r.length-1]='C'
    __assert_taint__(r[r.length - 1], false);
}

var x1 = 'b';
__set_taint__(x1);

test(x1);
