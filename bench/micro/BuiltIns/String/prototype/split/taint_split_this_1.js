// @type taint
// @target es5 String.prototype.split
// @feature builtin split
// @done

function __test_taint__(tainted) {
    var x = tainted + 'X' + 'b';

    var parts = x.split('X');

    // @witness __test_taint__('xx') => parts[0]='xx'
    __assert_taint__(parts[0], true);
}

__test_taint__(__set_taint__('a'));
