// @type taint
// @target es6+ String.prototype.charCodeAt
// @feature builtin charCodeAt
// @done

function test(x1) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + x1 + x2;

    // @witness always x.charCodeAt(0)=104 ('h', clean prefix)
    __assert_taint__(x.charCodeAt(0), false);

    // @witness test('x') => x.charCodeAt(1)=120 ('x', first tainted char)
    __assert_taint__(x.charCodeAt(1), true);

    // @witness always x.charCodeAt(x.length-1)=105 ('i', clean suffix)
    __assert_taint__(x.charCodeAt(x.length - 1), false);

    // @witness always x.charCodeAt(x.length)=NaN (just past end)
    __assert_taint__(x.charCodeAt(x.length), false);
}

var x = 'hello';
__set_taint__(x);
test(x);
