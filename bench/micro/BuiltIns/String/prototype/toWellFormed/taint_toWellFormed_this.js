// @type taint
// @target es2024 String.prototype.toWellFormed
// @feature builtin toWellFormed

function test(x1) {
    var x = 'h' + x1 + 'i';
    var r = x.toWellFormed();

    // @witness always r[0]='h' (clean prefix)
    __assert_taint__(r[0], false);

    // @witness test('x') => r[1]='x' (tainted char)
    __assert_taint__(r[1], true);

    // @witness always r[r.length-1]='i' (clean suffix)
    __assert_taint__(r[r.length - 1], false);
}

var x1 = 'x';
__set_taint__(x1);
test(x1);
