// @type taint
// @target es6+ String.prototype.trimLeft
// @feature builtin trimLeft

function test(x1) {
    var x0 = 'a';
    var x = '  ' + x1 + x0;
    var r = x.trimLeft();

    // @witness test('x') => r[0]='x'
    __assert_taint__(r[0], true);

    // @witness always r[r.length-1]='a'
    __assert_taint__(r[r.length - 1], false);
}

var x1 = 'b';
__set_taint__(x1);

test(x1);
