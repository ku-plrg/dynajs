// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// @done

function __test_taint__(tainted) {
    var x = 'abc';

    var r = x.replace('b', tainted);

    // @witness always r[0]='a' from clean receiver
    __assert_taint__(r[0], false);

    // @witness __test_taint__('xx') => r[1]='x' from tainted
    __assert_taint__(r[1], true);

    // @witness __test_taint__('xx') => r[2]='x' from tainted
    __assert_taint__(r[2], true);

    // @witness always r[r.length-1]='c' clean suffix from receiver
    __assert_taint__(r[r.length-1], false);
}

__test_taint__(__set_taint__('YZ'));
