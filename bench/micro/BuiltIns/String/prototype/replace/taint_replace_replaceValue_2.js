// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// @done

function __test_taint__(tainted) {
    var x = 'abc';

    var r = x.replace('b', tainted);

    // @witness __test_taint__('xx') => r[1]='x' from tainted
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('YZ'));
