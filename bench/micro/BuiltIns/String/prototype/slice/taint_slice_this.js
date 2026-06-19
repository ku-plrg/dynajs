// @type taint
// @target es5 String.prototype.slice
// @feature builtin slice

function test(x1) {
    var x0 = 'f';
    var x2 = 'o';
    var x3 = 'b';
    var x4 = 'a';
    var x = x0 + x1 + x2 + x3 + x4;

    // @witness always x.slice(1,4)[0]='o' (clean)
    __assert_taint__(x.slice(1, 4)[0], false);

    // @witness test('x') => x.slice(1,4)[1]='x' (tainted)
    __assert_taint__(x.slice(1, 4)[1], true);

    // @witness always x.slice(4,4)='' empty
    __assert_taint__(x.slice(4, 4), false);
}

var x1 = 'o';
__set_taint__(x1);

test(x1);
