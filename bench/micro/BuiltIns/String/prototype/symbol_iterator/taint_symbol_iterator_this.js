// @type taint
// @target es6+ String.prototype[Symbol.iterator]
// @feature builtin symbol-iterator

function test(x1) {
    var x = 'h' + x1 + 'i';
    var chars = [...x];

    // @witness always chars[0]='h' (clean prefix)
    __assert_taint__(chars[0], false);

    // @witness test('x') => chars[1]='x' (tainted char)
    __assert_taint__(chars[1], true);

    // @witness always chars[chars.length-1]='i' (clean suffix)
    __assert_taint__(chars[chars.length - 1], false);
}

var x1 = 'x';
__set_taint__(x1);
test(x1);
