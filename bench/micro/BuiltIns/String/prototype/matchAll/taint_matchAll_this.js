// @type taint
// @target es6+ String.prototype.matchAll
// @feature builtin matchAll
// done

function test(d0) {
    var d1 = 'z';
    var x = d0 + d1;
    var re = /[a-z]/g;

    var arr = [...x.matchAll(re)];

    // @witness test('x') => arr[0][0]='x' from tainted d0 (first match)
    __assert_taint__(arr[0][0], true);

    // @witness always arr[arr.length-1][0]='z' from clean d1 (last match)
    __assert_taint__(arr[arr.length - 1][0], false);
}

var d0 = 'x';
__set_taint__(d0);

test(d0);
