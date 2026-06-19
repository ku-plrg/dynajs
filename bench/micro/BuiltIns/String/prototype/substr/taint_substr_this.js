// @type taint
// @target es5 String.prototype.substr
// @feature builtin substr

function test(x1) {
    var x0 = 'f';
    var x2 = 'o';
    var x3 = 'b';
    var x4 = 'a';
    var x = x0 + x1 + x2 + x3 + x4;

    // @witness always x.substr(1,3)[0]='o' (clean)
    __assert_taint__(x.substr(1, 3)[0], false);

    // @witness test('x') => x.substr(1,3)[1]='x' (tainted)
    __assert_taint__(x.substr(1, 3)[1], true);

    // @witness always x.substr(2,0)='' empty
    __assert_taint__(x.substr(2, 0), false);
}

var x1 = 'o';
__set_taint__(x1);

test(x1);
