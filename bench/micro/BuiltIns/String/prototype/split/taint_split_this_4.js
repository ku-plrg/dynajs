// @type taint
// @target es5 String.prototype.split
// @feature builtin split
// @done

function __test_taint__(tainted) {
    var x = tainted + 'X' + 'b';

    var parts = x.split('X');

    // @witness always parts[parts.length-1][0]='b'
    __assert_taint__(parts[parts.length - 1][0], false);
}

__test_taint__(__set_taint__('a'));
