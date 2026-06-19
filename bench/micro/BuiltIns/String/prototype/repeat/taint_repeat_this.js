// @type taint
// @target es6+ String.prototype.repeat
// @feature builtin repeat

function test(x1) {
    var x0 = 'b';
    var x = x1 + x0;
    var r = x.repeat(2);

    // @witness test('x') => r[0]='x' (tainted)
    __assert_taint__(r[0], true);

    // @witness always r[r.length-1]='b' (clean suffix)
    __assert_taint__(r[r.length - 1], false);

    // @witness test('x') => r[2]='x' (tainted, second copy)
    __assert_taint__(r[2], true);

    // @witness always x.repeat(0)='' empty
    __assert_taint__(x.repeat(0), false);
}

var x1 = 'a';
__set_taint__(x1);

test(x1);
