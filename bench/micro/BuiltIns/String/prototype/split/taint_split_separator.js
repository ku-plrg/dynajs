// @type taint
// @target es5 String.prototype.split
// @feature builtin split
// done

function test(sep) {
    var x = 'aXb';

    var parts = x.split(sep);

    // @witness always parts[0]='a'; tainted sep is only the delimiter (not in output)
    __assert_taint__(parts[0], false);

    // @witness always parts[1]='b'; tainted sep is only the delimiter (not in output)
    __assert_taint__(parts[1], false);
}

var sep = 'X';
__set_taint__(sep);

test(sep);
