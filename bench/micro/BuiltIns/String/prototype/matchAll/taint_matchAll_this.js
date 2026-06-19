// @type taint
// @target es6+ String.prototype.matchAll
// @feature builtin matchAll
// done

function test(d0) {
    var d1 = '2';
    var x = 'a' + d0 + 'b' + d1;
    var re = /\d/g;

    var arr = [...x.matchAll(re)];

    // @witness test('x') => arr[0][0][0]='x' from tainted d0 (first digit)
    __assert_taint__(arr[0][0][0], true);

    // @witness always arr[arr.length-1][0]='2' from clean d1 (last digit)
    __assert_taint__(arr[arr.length - 1][0][0], false);
}

var d0 = '1';
__set_taint__(d0);

test(d0);
