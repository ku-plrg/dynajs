// @type taint
// @target es5 String.prototype.match
// @feature builtin match
// done

function test(d0) {
    var d1 = 'z';
    var x = d0 + d1;

    var m = x.match(/[a-z]+/);

    // @witness test('x') => m[0][0]='x' from tainted d0
    __assert_taint__(m[0][0], true);

    // @witness always m[0][m[0].length-1]='z' clean suffix from d1
    __assert_taint__(m[0][m[0].length - 1], false);

    // @witness no-match returns null => untaint
    __assert_taint__(x.match(/Q/), false);
}

var d0 = 'x';
__set_taint__(d0);

test(d0);
