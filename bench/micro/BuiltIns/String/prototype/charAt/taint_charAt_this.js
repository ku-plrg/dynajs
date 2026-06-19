// @type taint
// @target es6+ String.prototype.charAt
// @feature builtin charAt

function test(x1) {
    var x0 = 'f';
    var x2 = 'o';
    var x = x0 + x1 + x2;

    // @witness test('o') => x.charAt(0)='f' (clean prefix)
    __assert_taint__(x.charAt(0), false);

    // @witness test('x') => x.charAt(1)='x' (tainted char)
    __assert_taint__(x.charAt(1), true);

    // @witness always x.charAt(x.length-1)='o' (clean suffix)
    __assert_taint__(x.charAt(x.length-1), false);

    // @witness always x.charAt(x.length)='' (just past end)
    __assert_taint__(x.charAt(x.length), false);
}

var x1 = 'o';
__set_taint__(x1);
test(x1);
