// @type taint
// @target es6+ String.prototype.charAt
// @feature builtin charAt
// @done

function test(x1) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + x1 + x2;

    // @witness always x.charAt(0)='h' (clean prefix)
    __assert_taint__(x.charAt(0), false);

    // @witness test('x') => x.charAt(1)='x' (first tainted char)
    __assert_taint__(x.charAt(1), true);

    // @witness always x.charAt(x.length-1)='i' (clean suffix)
    __assert_taint__(x.charAt(x.length - 1), false);

    // @witness always x.charAt(x.length)='' (just past end)
    __assert_taint__(x.charAt(x.length), false);
}

var x = 'hello';
__set_taint__(x);
test(x);
