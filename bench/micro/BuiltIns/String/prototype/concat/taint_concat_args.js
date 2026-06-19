// @type taint
// @target es5 String.prototype.concat
// @feature builtin concat

function test(a1) {
    var base = 'ab';
    var r = base.concat(a1, 'Y');

    // @witness always r[0]='a' (clean receiver)
    __assert_taint__(r[0], false);

    // @witness always r[1]='b' (clean receiver)
    __assert_taint__(r[1], false);

    // @witness test('x') => r[2]='x' (tainted arg)
    __assert_taint__(r[2], true);

    // @witness always r[r.length-1]='Y' (clean suffix)
    __assert_taint__(r[r.length - 1], false);
}

var a1 = 'X';
__set_taint__(a1);
test(a1);
