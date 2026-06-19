// @type taint
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt

function test(x1) {
    var x0 = 'f';
    var x2 = 'o';
    var x = x0 + x1 + x2;

    // @witness test('o') => x.codePointAt(0)=102 ('f', clean prefix)
    __assert_taint__(x.codePointAt(0), false);

    // @witness test('x') => x.codePointAt(1)=42 (tainted char content)
    __assert_taint__(x.codePointAt(1), true);

    // @witness always x.codePointAt(x.length-1)=111 ('o', clean suffix)
    __assert_taint__(x.codePointAt(x.length-1), false);

    // @witness always x.codePointAt(x.length)=undefined (just past end)
    __assert_taint__(x.codePointAt(x.length), false);
}

var x1 = 'o';
__set_taint__(x1);
test(x1);
