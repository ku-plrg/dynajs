// @type taint
// @target es6+ String.prototype.padStart
// @feature builtin padStart

function test(x1) {
    var x0 = 'f';
    var x = x1 + x0;
    var r4 = x.padStart(4, '.');
    var r1 = x.padStart(1, '.');

    // @witness test('x') => r4[2]='x' (tainted)
    __assert_taint__(r4[2], true);

    // @witness always r4[r4.length-1]='f' (clean suffix)
    __assert_taint__(r4[r4.length - 1], false);

    // @witness test('x') => r1[0]='x' (no pad; first char tainted)
    __assert_taint__(r1[0], true);

    // @witness always r1[r1.length-1]='f' (clean suffix)
    __assert_taint__(r1[r1.length - 1], false);
}

var x1 = 'o';
__set_taint__(x1);

test(x1);
