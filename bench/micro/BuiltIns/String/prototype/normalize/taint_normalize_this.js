// @type taint
// @target es6+ String.prototype.normalize
// @feature builtin normalize

function test(x1) {
    var x0 = 'f';
    var x2 = 'o';
    var x = x0 + x1 + x2;
    var r = x.normalize('NFC');

    // @witness always r[0]='f'
    __assert_taint__(r[0], false);

    // @witness test('x') => r[1]='x'
    __assert_taint__(r[1], true);

    // @witness always r[r.length-1]='o'
    __assert_taint__(r[r.length - 1], false);
}

var x1 = 'o';
__set_taint__(x1);

test(x1);
