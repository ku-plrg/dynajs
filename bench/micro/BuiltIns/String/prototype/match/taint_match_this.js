// @type taint
// @target es5 String.prototype.match
// @feature builtin match
// done

function test(d0) {
    var d1 = '2';
    var x = 'ab' + d0 + d1;

    var m = x.match(/\d+/);

    // @witness test('x') => m[0][0]='x' from tainted d0
    __assert_taint__(m[0][0], true);

    // @witness always m[0][m[0].length-1]='2' clean suffix from d1
    __assert_taint__(m[0][m[0].length-1], false);

    // @witness always no-match returns null => untaint
    __assert_taint__(x.match(/zzz/), false);
}

var d0 = '1';
__set_taint__(d0);

test(d0);
