// @type taint
// @target es5 String.prototype.concat
// @feature builtin concat

function test(x1) {
    var x = x1 + 'oo';
    var r = x.concat('bar');

    // @witness test('x') => r[0]='x' (tainted receiver char)
    __assert_taint__(r[0], true);

    // @witness always r[r.length-1]='r' (clean suffix of 'bar')
    __assert_taint__(r[r.length - 1], false);
}

var x1 = 'f';
__set_taint__(x1);

test(x1);
