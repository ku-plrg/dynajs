// @type taint
// @target es5 String.prototype.substring
// @feature builtin substring

function test(x1) {
    var x0 = 'f';
    var x2 = 'o';
    var x3 = 'b';
    var x4 = 'a';
    var x = x0 + x1 + x2 + x3 + x4;

    // @witness always x.substring(1,4)[0]='o' (clean)
    __assert_taint__(x.substring(1, 4)[0], false);

    // @witness test('x') => x.substring(1,4)[1]='x' (tainted)
    __assert_taint__(x.substring(1, 4)[1], true);

    // @witness always x.substring(2,2)='' empty
    __assert_taint__(x.substring(2, 2), false);
}

var x1 = 'o';
__set_taint__(x1);

test(x1);
