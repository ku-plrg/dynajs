// @type taint
// @target es5 String.prototype.split
// @feature builtin split
// done

function test(x1) {
    var x = x1 + 'X' + 'b';

    var parts = x.split('X');

    // @witness test('xx') => parts[0]='xx' (tainted token from receiver)
    __assert_taint__(parts[0], true);

    // @witness always parts[parts.length-1]='b' (clean token)
    __assert_taint__(parts[parts.length - 1], false);

    // @witness test('x') => parts[0][0]='x' (tainted)
    __assert_taint__(parts[0][0], true);

    // @witness always parts[parts.length-1][0]='b' (clean)
    __assert_taint__(parts[parts.length - 1][0], false);
}

var x1 = 'a';
__set_taint__(x1);

test(x1);
