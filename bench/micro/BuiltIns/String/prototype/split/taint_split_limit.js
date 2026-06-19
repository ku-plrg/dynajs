// @type taint
// @target es5 String.prototype.split
// @feature builtin split
// done

function test(lim) {
    var x = 'a,b,c';

    var parts = x.split(',', lim);

    // @witness always parts[0]='a'; tainted lim is only the count
    __assert_taint__(parts[0], false);

    // @witness always parts[1]='b'; tainted lim is only the count
    __assert_taint__(parts[1], false);
}

var lim = 2;
__set_taint__(lim);

test(lim);
