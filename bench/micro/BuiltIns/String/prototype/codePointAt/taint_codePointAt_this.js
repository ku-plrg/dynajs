// @type taint
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt
// @done

function test(x1) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + x1 + x2;

    // @witness always x.codePointAt(0)=104 ('h', clean prefix)
    __assert_taint__(x.codePointAt(0), false);

    // @witness test('x') => x.codePointAt(1)=120 ('x', first tainted char)
    __assert_taint__(x.codePointAt(1), true);

    // @witness always x.codePointAt(x.length-1)=105 ('i', clean suffix)
    __assert_taint__(x.codePointAt(x.length - 1), false);

    // @witness always x.codePointAt(x.length)=undefined (just past end)
    __assert_taint__(x.codePointAt(x.length), false);
}

var x = 'hello';
__set_taint__(x);
test(x);
